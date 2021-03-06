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
 * Functional Storefront Unit Test - Registration Module Controller
 */
define(function (require) {
  'use strict';

  var ep = require('ep');

  describe('Registration Module: Controller: Helper Functions', function () {
    var registrationController = require('registration'); // load controller file

    before(function() {
      // Build a form element with 2 input fields
      var passwordInput = document.createElement('input');
      passwordInput.setAttribute('name', 'password');

      var passwordConfirmInput = document.createElement('input');
      passwordConfirmInput.setAttribute('name', 'passwordConfirm');

      this.fakeFormEl = document.createElement('form');
      this.fakeFormEl.appendChild(passwordInput);
      this.fakeFormEl.appendChild(passwordConfirmInput);
    });

    after(function() {
      delete(this.fakeFormEl);
    });

    describe('Function: getJSONFormData', function() {
      describe('When called with a form containing a "passwordConfirm" input', function() {
        before(function() {
          this.parsedJSONObj = JSON.parse(registrationController.__test_only__.getJSONFormData(this.fakeFormEl));
        });

        after(function() {
          delete(this.parsedJSONObj);
        });

        it("returns a JSON object with the correct values", function() {
          // The password value should be in the returned JSON object
          expect(_.has(this.parsedJSONObj, 'password')).to.be.true;

          // The passwordConfirm value should NOT be in the returned JSON object
          expect(_.has(this.parsedJSONObj, 'passwordConfirm')).to.be.false;
        });
      });
    });

    describe('Function: isPasswordConfirmed', function() {
      describe('When called with a valid form with matching password fields', function() {
        before(function() {
          this.fakeFormEl.password.setAttribute('value', 'password123');
          this.fakeFormEl.passwordConfirm.setAttribute('value', 'password123');
        });

        it("returns true", function() {
          expect(registrationController.__test_only__.isPasswordConfirmed(this.fakeFormEl)).to.be.true;
        });
      });

      describe('When called with a valid form with non-matching password fields', function() {
        before(function() {
          this.fakeFormEl.password.setAttribute('value', 'password123');
          this.fakeFormEl.passwordConfirm.setAttribute('value', 'password321');
        });

        it("returns false", function() {
          expect(registrationController.__test_only__.isPasswordConfirmed(this.fakeFormEl)).to.be.false;
        });
      });

      describe('When called with an invalid form', function() {
        before(function() {
          // Remove one of the password inputs that the function is expecting
          var passwordInput = this.fakeFormEl.children[0];

          this.fakeFormEl = this.fakeFormEl.removeChild(passwordInput);

          sinon.stub(ep.logger, 'warn');

          registrationController.__test_only__.isPasswordConfirmed(this.fakeFormEl);
        });

        after(function() {
          ep.logger.warn.restore();
        });

        it("logs a warning", function() {
          expect(ep.logger.warn).to.be.calledOnce;
        });
      });
    });

  });

});