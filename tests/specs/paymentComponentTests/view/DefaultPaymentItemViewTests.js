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
 * Functional Storefront Unit Test - Paynment Component Views
 */
define(function (require) {
  var ep = require('ep');
  var Backbone = require('backbone');

  var paymentView = require('payment.views');
  var paymentTemplate = require('text!modules/base/components/payment/base.component.payment.template.html');


  describe('Payment Module: View:', function () {
    describe('DefaultPaymentItemView', function () {
      var StandardTokenPaymentModel = Backbone.Model.extend({
        defaults: {
          displayValue: 'timmins-token-X'
        }
      });

      before(function () {
        // append templates
        $("#Fixtures").append(paymentTemplate);
      });

      after(function () {
        $("#Fixtures").empty();
        delete(this.view);
      });

      describe('can render', function () {
        before(function () {
          this.view = new paymentView.DefaultPaymentItemView({model: new Backbone.Model()});
        });

        it('should be an instance of ItemView object', function () {
          expect(this.view).to.be.an.instanceOf(Marionette.ItemView);
        });
        it('render() should return the view object', function () {
          expect(this.view.render()).to.be.equal(this.view);
        });
      });

      describe('renders correctly with all fields of payment method model', function () {
        before(function () {
          this.model = new StandardTokenPaymentModel();

          // setup view & render
          this.view = new paymentView.DefaultPaymentItemView({model: this.model});
          this.view.render();
        });

        after(function () {
          this.model.destroy();
        });

        it('should render as UL (unordered list)', function () {
          expect(this.view.el.nodeName).to.equal('SPAN');
        });
        it('should render token payment display value', function () {
          expect(this.view.$el.text()).to.have.string(this.model.get('displayValue'));
        });
      });
    });
  });

});