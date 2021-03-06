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
 * Functional Storefront Unit Test - Checkout Views
 */
define(function (require) {
  var Backbone = require('backbone');
  var ep = require('ep');

  describe('CheckoutSummaryView', function () {
    var views = require('checkout.views');
    var template = require('text!modules/base/checkout/base.checkout.templates.html');

    // Mock the model with just the data we need
    var rawData = {
      "totalQuantity": 1,
      "subTotal": {
        "currency": "CAD",
        "amount": 4.99,
        "display": "$4.99"
      },
      "taxTotal": {
        "currency": "CAD",
        "amount": 0.6,
        "display": "$0.60"
      },
      "taxes": [
        {
          "currency": "CAD",
          "amount": 0.35,
          "display": "$0.35",
          "title": "PST"
        },
        {
          "currency": "CAD",
          "amount": 0.25,
          "display": "$0.25",
          "title": "GST"
        }
      ],
      "total": {
        "currency": "CAD",
        "amount": 5.59,
        "display": "$5.59"
      },
      "submitOrderActionLink": "fakeSubmitLink"
    };

    before(function () {
      $("#Fixtures").append(template);
      this.view = new views.CheckoutSummaryView({
        model: new Backbone.Model(rawData)
      });
      this.view.render();
    });

    after(function () {
      $("#Fixtures").empty();
      delete this.view;
    });

    it('should be an instance of Marionette Layout object', function () {
      expect(this.view).to.be.an.instanceOf(Marionette.Layout);
    });
    it('render() should return the view object', function () {
      expect(this.view.render()).to.be.equal(this.view);
    });

    describe('regions', function () {
      it('should have a checkoutTaxBreakDownRegion region', function () {
        expect(this.view.checkoutTaxBreakDownRegion).to.exist;
        expect(this.view.$el.find('[data-region="checkoutTaxBreakDownRegion"]')).to.be.length(1);
      });
    });

    describe('renders view content correctly', function () {
      it('renders the total quantity', function () {
        expect(Number($('[data-el-value="checkout.totalQuantity"]', this.view.$el).text()))
          .to.be.equal(rawData.totalQuantity);
      });
      it('renders the sub total', function () {
        expect($('[data-el-value="checkout.subTotal"]', this.view.$el).text())
          .to.be.equal(rawData.subTotal.display);
      });
      it('renders the checkout total', function () {
        expect($('[data-el-value="checkout.total"]', this.view.$el).text())
          .to.be.equal(rawData.total.display);
      });
    });

    describe('when missing taxTotal & taxes', function () {
      before(function () {
        // Remove taxes array and taxTotal object from our raw data
        rawData.taxes = [];
        rawData.taxTotal = {};

        sinon.stub(ep.logger, 'error');

        this.view = new views.CheckoutSummaryView({
          model: new Backbone.Model(rawData)
        });
        this.view.render();
      });

      after(function () {
        ep.logger.error.restore();
      });

      it('view renders without error', function () {
        expect(ep.logger.error).to.be.not.called;
      });
    });
  });

});