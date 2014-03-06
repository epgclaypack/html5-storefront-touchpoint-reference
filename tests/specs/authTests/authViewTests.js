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
 * Functional Storefront Unit Test - Auth Views
 */
define(function (require) {
  var templates = require('text!modules/base/auth/base.auth.templates.html');
  var authView = require('auth.views');
  var authModel = require('auth.models');

  describe('Auth Module: Views', function () {
    before(function() {
      this.$fixture = $('<div data-region="authMenuItemRegion"></div>');
      this.$fixture.empty().appendTo($("#Fixtures"));
      this.$fixture.append(templates);
      this.authMenuItemRegion = new Marionette.Region({
        el: '[data-region="authMenuItemRegion"]'
      });

      this.view = new authView.DefaultView({
        model: new authModel.LoginFormModel()
      });
      this.authMenuItemRegion.show(this.view);
    });

    after(function() {
      $("#Fixtures").empty();
    });

    it("DefaultView should exist", function () {
      expect(authView.DefaultView).to.exist;
    });
    it("LoginFormView should exist", function () {
      expect(authView.LoginFormView).to.exist;
    });
    it("ProfileMenuView should exist", function () {
      expect(authView.ProfileMenuView).to.exist;
    });
    it("getLoginRequestModel should exist", function () {
      expect(authView.getLoginRequestModel).to.exist;
    });
    it("Login Button and hidden menu container should exist", function () {
      expect($('.btn-auth-menu').html()).to.exist;
      expect($('.auth-nav-container').html()).to.exist;
    });
  });
});