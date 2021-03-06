/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * Address Component Controller
 * The HTML5 Reference Storefront's MVC controller for displaying an address, and creating an address.
 */

define(function (require) {
  var ep = require('ep');
  var i18n = require('i18n');
  var EventBus = require('eventbus');
  var Mediator = require('mediator');

  var Views = require('address.views');
  var Models = require('address.models');
  var template = require('text!modules/base/components/address/base.component.address.template.html');
  var utils = require('utils');

  $('#TemplateContainer').append(template);

  _.templateSettings.variable = 'E';

  var countryCollection = new Models.CountryCollection();
  var regionCollection = new Models.RegionCollection();

  var addressFormView = new Views.DefaultAddressFormView();

  // Define the create and edit layouts here to make them available to event handlers
  var createAddressLayout;
  var editAddressLayout;

  /**
   * Instantiate an DefaultCreateAddressLayout and load views into corresponding regions on DefaultCreateAddressLayout.
   * @returns {Views.DefaultCreateAddressLayout} fully rendered DefaultCreateAddressLayout
   */
  var defaultCreateAddressController = function () {
    // Ensure the user is authenticated before rendering the address form
      var addressModel = new Models.CreateAddressModel();
      createAddressLayout = new Views.DefaultCreateAddressLayout({
        model: addressModel
      });

      addressModel.fetch({
        success: function(response) {
          addressModel = response;
          createAddressLayout.addressFormRegion.show(defaultAddressFormController(response));
        }
      });

      return createAddressLayout;
  };

  /**
   * Instantiate an DefaultEditAddressLayout and load views into corresponding regions on DefaultEditAddressLayout.
   * @returns {Views.DefaultEditAddressLayout} fully rendered DefaultEditAddressLayout
   */
  var defaultEditAddressController = function(href) {
    var addressModel = new Models.AddressModel();
    editAddressLayout = new Views.DefaultEditAddressLayout({
      model: addressModel
    });

    addressModel.fetch({
      url: ep.ui.decodeUri(href),
      success: function(response) {
        addressModel = response;
        editAddressLayout.addressFormRegion.show(defaultAddressFormController(response));
      }
    });

    return editAddressLayout;
  };

  /**
   * Instantiate a DefaultAddressFormView and load country and regions views into corresponding regions.
   * @param addressModel  data model of address to edit.
   * @returns {Views.DefaultAddressFormView}  fully rendered DefaultAddressFormView
   */
  var defaultAddressFormController = function (addressModel) {
    var countriesView = new Views.DefaultCountriesView();
    var regionsView = new Views.DefaultRegionsView({
      collection: regionCollection
    });

    addressFormView.model = addressModel;

    countryCollection.fetch({
      success: function (response) {
        if (addressModel && addressModel.get('country')) {
          var countryCode = addressModel.get('country');
          var regionCode = addressModel.get('region');

          var regionsLink = getRegionLink(response, countryCode);
          EventBus.trigger('address.updateChosenCountryRequest', countryCode, regionsLink, regionCode);
        }
        else {
          regionCollection.reset();
        }

        countriesView.collection = response;

        addressFormView.countriesRegion.show(countriesView);
        addressFormView.regionsRegion.show(regionsView);
      }
    });

    function getRegionLink(collection, code) {
      var link;

      var selectedCountry = collection.where({name: code})[0];
      if (selectedCountry) {
        link = selectedCountry.get('regionLink');
      }
      else {
        ep.logger.warn('No country with given countryCode (' + code + ') was found while retrieving regionLink');
      }
      return link;
    }

    return addressFormView;
  };

  /* *********** Event Listeners: load display address view  *********** */
  /**
   * Listening to load default display address view request,
   * will load the default view in appMainRegion.
   * @param addressObj  contains region to render in and the model to render with
   */
  EventBus.on('address.loadAddressesViewRequest', function (addressObj) {
    try {
      var addressView = new Views.DefaultAddressItemView({
        model: addressObj.model
      });

      addressObj.region.show(addressView);
    } catch (error) {
      ep.logger.error('failed to load Address Views: ' + error.message);
    }
  });

  /* *************** Event Listeners: update chosen country / regions *************** */
  EventBus.on('address.countrySelectionChanged', function(countryCode, regionsLink, regionCode) {
    EventBus.trigger('address.updateChosenCountryRequest', countryCode, regionsLink, regionCode);
  });

  EventBus.on('address.regionSelectionChanged', function(regionCode) {
    EventBus.trigger('address.updateChosenRegionRequest', regionCode);
  });

  /**
   * Listening to update chosen country request. Will set the selected country in collection,
   * and fetch region collection.
   */
  EventBus.on('address.updateChosenCountryRequest', function(countryCode, regionsLink, regionCode) {
    setSelectedCountry(countryCode);

    if (addressFormView.regionsRegion.currentView) {
      ep.ui.startActivityIndicator(addressFormView.regionsRegion.currentView, 'small');
    }

    fetchRegionCollection(regionsLink, regionCode);
  });

  EventBus.on('address.updateChosenRegionRequest', function(regionCode) {
    setSelectedRegion(regionCode);
  });

  /**
   * Fetches the regions collection with given link, and set selected country.
   * <li>If given a link, fetch the regions collection</li>
   * <li>If no link given, will reset the region collection. This is in case a regions collection was loaded
   * for some country, and then user select no country, no region should be loaded or selected.</li>
   * <li>If given a regionCode value, will trigger event to set a selected region.</li>
   * @param regionsLink link to fetch regions collection from Cortex server
   * @param regionCode  code value of the region to select
   */
  function fetchRegionCollection(regionsLink, regionCode) {
    if(regionCode && !regionsLink) {
      ep.logger.error('Fail to fetch regions collection, missing regions link');
      return;
    }

    if (regionsLink) {
      regionCollection.fetch({
        url: regionCollection.getUrl(regionsLink),
        success: function(response) {
          if (regionCode) {
            EventBus.trigger('address.updateChosenRegionRequest', regionCode);
          }

          ep.ui.stopActivityIndicator(addressFormView.regionsRegion.currentView);
        }
      });
    }
    else {
      regionCollection.reset();
      ep.ui.stopActivityIndicator(addressFormView.regionsRegion.currentView);
    }

  }

  /**
   * Set the selected country in collection with given country code.
   * @param countryCode the code value of country to be selected.
   */
  function setSelectedCountry(countryCode) {
    var deselect = countryCollection.where({selected: true})[0];
    if (deselect) {
      deselect.unset('selected');
    }

    var selected = countryCollection.where({name: countryCode})[0];
    selected.set('selected', true);
  }

  /**
   * Set the selected region in collection with given region code.
   * @param regionCode the code value of region to be selected.
   */
  function setSelectedRegion(regionCode) {
    var deselect = regionCollection.where({selected: true})[0];
    if (deselect) {
      deselect.unset('selected');
    }

    var selected = regionCollection.where({name: regionCode})[0];
    selected.set('selected', true);
  }

  /**
   * Re-enables the relevant address form submit button based on which form (create or edit)
   * is currently being displayed and renders an error message to the appropriate region.
   *
   * @param errorMsg an error message, or an i18n key to the error message
   */
  function renderAddressFormErrorState(errorMsg) {
    var currentLayout;
    var buttonName;

    // Identify the current layout by checking whether or not the createAddressLayout is closed
    if (createAddressLayout && !createAddressLayout.isClosed) {
      currentLayout = createAddressLayout;
      buttonName = 'createAddressButton';
    } else {
      currentLayout = editAddressLayout;
      buttonName = 'editAddressButton';
    }

    // Attempt to retrieve the value of addressFormRegion.currentView.ui.feedbackRegion from the current layout
    var feedbackMsgRegion = utils.getDescendedPropertyValue(currentLayout, ['addressFormRegion', 'currentView', 'ui', 'feedbackRegion']);
    if (feedbackMsgRegion ) {
      // The create address layout is being rendered
      ep.ui.enableButton(currentLayout, buttonName);
      utils.renderMsgToPage(
        errorMsg,
        feedbackMsgRegion
      );
    }
  }

  /* *************** Event Listeners: create address  *************** */
  /**
   * Listening to create address button clicked signal,
   * will trigger request to get address form (to get action link to post form to)
   */
  EventBus.on('address.createAddressBtnClicked', function (href) {
    ep.ui.disableButton(createAddressLayout, 'createAddressButton');
    EventBus.trigger('address.submitAddressRequest', 'POST', href);
  });

  /**
   * Uses a modal window to confirm the delete action for an address.
   * @param {Object} obj Contains an href representing the address to be deleted and an optional reference to a
   *                     Marionette.View to which an activity indicator should be applied.
   */
  EventBus.on('address.deleteAddressConfirm', function (obj) {
    EventBus.trigger('layout.loadRegionContentRequest', {
      region: 'appModalRegion',
      module: 'address',
      view: 'DefaultDeleteAddressConfirmationView',
      data: obj
    });
  });

  /**
   * Called when the yes button in the confirm deletion modal is clicked. This handler closes any open modal windows,
   * optionally applies an activity indicator to the Marionette.View represented by the opts.indicatorView
   * parameter and triggers the delete request to Cortex.
   */
  EventBus.on('address.deleteConfirmYesBtnClicked', function(opts) {
    $.modal.close();
    // Apply an activity indicator to any view passed in the options
    if (opts.indicatorView) {
      ep.ui.startActivityIndicator(opts.indicatorView);
    }
    EventBus.trigger('address.deleteAddressRequest', opts);
  });

  /**
   * Listening to create address button clicked signal,
   * will trigger request to get address form (to get action link to post form to)
   */
  EventBus.on('address.editAddressBtnClicked', function(href) {
    ep.ui.disableButton(editAddressLayout, 'editAddressButton');
    EventBus.trigger('address.submitAddressRequest', 'PUT', href);
  });

  /**
   * Called when a request to delete an address from Cortex has failed. Displays a toast message and stops
   * any activity indicator that has been applied to the Marionette.View referenced by the parameter.
   * On close of the toast message, we invoke a full page refresh.
   * @param indicatorView a reference to a Marionette.View to which an activity indicator has been applied
   */
  EventBus.on('address.deleteAddressFailed', function (indicatorView) {
    $().toastmessage('showToast', {
      text: i18n.t('addressForm.errorMsg.deleteErr'),
      sticky: true,
      position: 'middle-center',
      type: 'error',
      close: function() {
        Backbone.history.loadUrl();
      }
    });

    // Stop any activity indicator
    if (indicatorView) {
      ep.ui.stopActivityIndicator(indicatorView);
    }
  });

  /**
   * Called when an address has been successfully deleted from Cortex. Fires a mediator strategy to notify
   * the referring module.
   * @param indicatorView an optional reference to a Marionette.View used as the target for the activity indicator
   */
  EventBus.on('address.deleteAddressSuccess', function (indicatorView) {
    Mediator.fire('mediator.deleteAddressComplete', indicatorView);
  });

  /**
   * Builds and submits an AJAX request to Cortex to delete an address.
   * @param {Object} opts Contains the href used to identify the address to be deleted in Cortex
   */
  EventBus.on('address.deleteAddressRequest', function (opts) {
    if (_.isObject(opts)) {
      // Build AJAX request
      var ajaxModel = new ep.io.defaultAjaxModel({
        type: 'DELETE',
        url: opts.href,
        success: function () {
          EventBus.trigger('address.deleteAddressSuccess', opts.indicatorView);
        },
        customErrorFn: function () {
          EventBus.trigger('address.deleteAddressFailed', opts.indicatorView);
        }
      });

      // Send AJAX request to Cortex
      ep.io.ajax(ajaxModel.toJSON());
    } else {
      ep.logger.error('deleteAddressRequest event triggered without a valid options object');
    }
  });

  /**
   * Listening to create new address request,
   * will submit address form to cortex,
   */
  EventBus.on('address.submitAddressRequest', function(method, href) {
    submitAddressRequest(method, href);
  });

  /**
   * Listening to address form submission failed signal (general error),
   * will display generic error message.
   */
  EventBus.on('address.submitAddressFormFailed', function () {
    renderAddressFormErrorState('addressForm.errorMsg.generalSaveAddressFailedErrMsg');
  });

  /**
   * Listening to address form submission failed signal (invalid form),
   * will display error message sent back from cortex.
   * @param errMsg an error message, or a i18n key to the error message
   */
  EventBus.on('address.submitAddressFormFailed.invalidFields', function (errMsg) {
    // in the future, also highlight the invalid input box
    var translatedMsg = Views.translateErrorMessage(errMsg);
    renderAddressFormErrorState(translatedMsg);
  });

  /**
   * Listening to submit address form success signal,
   * will call mediator strategy to notify storefront addressForm module is done.
   */
  EventBus.on('address.submitAddressFormSuccess', function() {
    Mediator.fire('mediator.addressFormComplete');
  });

  /**
   * Listen to cancel button clicked signal,
   * will redirect page set by returnUrl.
   */
  EventBus.on('address.cancelBtnClicked', function() {
    Mediator.fire('mediator.addressFormComplete');
  });

  /**
   * Send an address request to cortex.
   * @param type The AJAX type of the request POST (create) or PUT (update)
   * @param submitAddressFormLink to POST the request to.
   */
  function submitAddressRequest(type, submitAddressFormLink) {
    var form = Views.getAddressFormValues();

    var ajaxModel = new ep.io.defaultAjaxModel({
      type: type,
      url: submitAddressFormLink,
      data: JSON.stringify(form),
      success: function () {
        EventBus.trigger('address.submitAddressFormSuccess');
      },
      customErrorFn: function (response) {
        if (response.status === 400) {
          EventBus.trigger('address.submitAddressFormFailed.invalidFields', response.responseText);
        }
        else {
          EventBus.trigger('address.submitAddressFormFailed');
        }
      }
    });

    ep.io.ajax(ajaxModel.toJSON());
  }

  /* test-code */
  var __test_only__ = {};
  __test_only__.defaultAddressFormController = defaultAddressFormController;
  __test_only__.renderAddressFormErrorState = renderAddressFormErrorState;
  /* end-test-code */

  return{
    /* test-code */
    __test_only__: __test_only__,
    /* end-test-code */
    DefaultCreateAddressView: defaultCreateAddressController,
    DefaultDeleteAddressConfirmationView: function(options) {
      return new Views.DefaultDeleteAddressConfirmationView(options);
    },
    DefaultEditAddressView: defaultEditAddressController
  };
});
