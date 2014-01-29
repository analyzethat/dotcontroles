/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles, $, jStorage */
(function (controles) {
	"use strict";

	controles.app = {
		initialize: function () {
			numeral.language("be-nl");
			moment.lang("nl");

			window.jStorage = $.jStorage.noConflict();
			controles.URL_DATASERVER = "http://data.dotcontroles.dev";
			controles.eventbus = new crafity.core.EventEmitter();
			console.element = document.querySelector(".console");

			var showLogin, showApp;
			var authenticationRepository = new controles.repositories.AuthenticationRepository();
			var usersRepository = new controles.repositories.UsersRepository(superagent, controles.URL_DATASERVER);
			var loginView = new controles.views.LoginView(authenticationRepository);
			var appView = new controles.views.AppView(authenticationRepository, usersRepository);
			var authenticatedUser = jStorage.get("authenticatedUser");

			controles.eventbus.on("loggedin", function (user) {
				usersRepository.authenticatedUser(user);
				document.body.removeChild(loginView.element());
				jStorage.set("authenticatedUser", user);
				showApp();
			});

			controles.eventbus.on("loggedout", function () {
				document.body.removeChild(appView.element());
				jStorage.deleteKey("authenticatedUser");
				showLogin();
			});

			showLogin = function () {
				document.body.appendChild(loginView.render());
				window.loginView = loginView;
				loginView.focus();

				return loginView; // useful for chaining
			};

			showApp = function () {
				document.body.appendChild(appView.render());
				return appView;
			};

			if (!authenticatedUser) {
				showLogin();
			} else {
				showApp(authenticatedUser);
				usersRepository.authenticatedUser(authenticatedUser);
			}
		}
	};

}(window.controles = window.controles || {}));
