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
 * Functional Storefront Unit Test - Payment Component Controller
 */
define(function (require) {
  var ep = require('ep');

  var controller = require('payment');
  var view = require('payment.views');
  var template = require('text!modules/base/components/payment/base.component.payment.template.html');

  describe('Payment Controller:', function () {
    describe('DefaultCreatePaymentController renders the correct view', function () {
      before(function () {
        $("#Fixtures").append(template);
        this.view = controller.DefaultCreatePaymentController();
        this.view.render();
      });

      after(function () {
        $("#Fixtures").empty();
        delete(this.view);
      });

      it('should return a view that is an instance of DefaultPaymentFormView', function () {
        expect(this.view).to.be.an.instanceOf(view.DefaultPaymentFormView);
      });
    });
  });
});