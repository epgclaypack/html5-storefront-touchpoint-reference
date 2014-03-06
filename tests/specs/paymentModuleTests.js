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
 * Functional Storefront Unit Test - Payment Method Component
 */
define(function (require) {
  'use strict';

  describe('Payment Method Component Tests', function () {

    /*
     * Controller Tests
     */
    // defaultCreatePaymentController Tests
    require('specs/paymentComponentTests/controller/defaultCreatePaymentControllerTests.js');

    // controller general Events Tests
    require('specs/paymentComponentTests/controller/paymentEventsTests.js');


    /*
     * View Tests
     */
    // DefaultPaymentItemView Tests
    require('specs/paymentComponentTests/view/defaultPaymentItemViewTests.js');

    // DefaultPaymentFormView Tests
    require('specs/paymentComponentTests/view/defaultPaymentFormViewTests.js');


    /*
     * Models Tests
     */
    // paymentForm Model tests
    require('specs/paymentComponentTests/model/paymentFormModelTests.js');


  });

});
