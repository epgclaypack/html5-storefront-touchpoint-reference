/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 * MVC controller that manages events to
 *  - login and logout users
 *  - render the profile drop-down menu
 *
 */
define(function (require) {
    var ep = require('ep');
    var Mediator = require('mediator');
    var EventBus = require('eventbus');

    var Model = require('auth.models');
    var View = require('auth.views');
    var template = require('text!modules/base/auth/base.auth.templates.html');

    $('#TemplateContainer').append(template);

    _.templateSettings.variable = 'E';

    var defaultView = function(options) {
      return new View.DefaultView(options);
    };

    // This variable is used to hold a reference to the LoginFormView - making it accessible to event handlers
    var loginFormView = {};

    /*
     * Load login menu - load login form or profile menu depend on authentication state
     */
    // auth menu item dropdown clicked
    // FIXME abstract logic 1 level down from btnClicked event
    EventBus.on('auth.btnAuthGlobalMenuItemClicked',function(){
      var triggerLogIn = true;
      // if user is logged in then show the menu dropdown
      var currentRole = ep.io.localStore.getItem('oAuthRole');
      if (currentRole && (currentRole === 'REGISTERED')){
        EventBus.trigger("auth.loadAuthMenuRequest");
        triggerLogIn = false;
      }
      // show the login modal
      if (triggerLogIn){
        EventBus.trigger('layout.loadRegionContentRequest', {
          region: 'appModalRegion',
          module: 'auth',
          view: 'LoginFormView'
        });
      }
    });

    // auth menu request
    EventBus.on('auth.loadAuthMenuRequest', function() {
      View.showProfileMenu();
      EventBus.trigger('layout.loadRegionContentRequest',{
        region:'mainAuthView',
        module:'auth',
        view: 'ProfileMenuView'
      });

    });

    /*
     *
     * Login Error Message Feedback
     */
    EventBus.on("auth.loginRequestFailed", function(msg) {
      ep.ui.enableButton(loginFormView, 'loginButton');
      View.displayLoginErrorMsg(msg);
    });

    EventBus.on("auth.loginFormValidationFailed", function(msg) {
      ep.ui.enableButton(loginFormView, 'loginButton');
      View.displayLoginErrorMsg(msg);

    });

    /*
     * Authentication Request Types:
     *  - Login (POST)
     *  - get Public Authentication (POST)
     *  - Logout (DELETE)
     */
    EventBus.on('auth.authenticationRequest', function(authObj) {
      ep.io.ajax(authObj);
    });

    /*
     * Login Button Clicked - submit login form to server
     */
    EventBus.on('auth.loginFormSubmitButtonClicked', function () {
      ep.ui.disableButton(loginFormView, 'loginButton');
      var requestModel = View.getLoginRequestModel();

      if (requestModel.isComplete()) {
        var authString = 'grant_type=password&username=' + requestModel.get('userName')
          + '&password=' + requestModel.get('password')
          + '&scope=' + requestModel.get('scope')
          + '&role=' + requestModel.get('role');

        var loginModel = new Model.LoginModel();
        loginModel.set('data', authString);
        loginModel.set('userName', requestModel.attributes.userName);

        EventBus.trigger('auth.authenticationRequest', loginModel.attributes);
      }
      else {
        EventBus.trigger('auth.loginFormValidationFailed', 'loginFormMissingFieldsErrMsg');
      }
    });

    /**
     * Handler for the click event on the login form register link. Fires a mediator strategy.
     */
    EventBus.on('auth.loginFormRegisterLinkClicked', function () {
      // Close the login form modal
      $.modal.close();
      Mediator.fire('mediator.registrationRequest');
    });

    /*
     * Generate Public Authentication Request
     *
     * handles both login and logout requests
     * uses different verbs - (POST/DELETE)
     *
     */
    EventBus.on('auth.generatePublicAuthTokenRequest', function() {
      var authString = 'grant_type=password&scope=' + ep.app.config.cortexApi.scope + '&role=PUBLIC';

      var publicAuthModel = new Model.LoginModel();
      publicAuthModel.set('data', authString);

      EventBus.trigger('auth.authenticationRequest', publicAuthModel.attributes);
    });

    /*
     * Logout Button Clicked - make logout request to server
     */
    EventBus.on('auth.logoutBtnClicked', function() {
      // Clear sessionStorage on logout
      ep.io.sessionStore.clear();

      var logoutModel = new Model.LogoutModel();
      EventBus.trigger('auth.authenticationRequest', logoutModel.attributes);
    });

    return {
      DefaultView:defaultView,
      LoginFormView: function(options) {
        // Store a reference to the LoginFormView before returning it
        loginFormView = new View.LoginFormView(options);
        return loginFormView;
      },
      ProfileMenuView: function() {return new View.ProfileMenuView(); }
    };
  }
);