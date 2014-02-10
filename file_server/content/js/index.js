/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles, $ */
(function (controles) {
	"use strict";

	controles.URL_DATASERVER = "http://data.dotcontroles.dev"; // TODOgasl get from config

	controles.app = {
		initialize: function () {
			numeral.language("be-nl");
			moment.lang("nl");

			window.jStorage = $.jStorage.noConflict();
			controles.eventbus = new crafity.core.EventEmitter();
			console.element = document.querySelector(".console");

			var showLogin, showApp;

			var authenticationRepository = new controles.repositories.AuthenticationRepository();
			var loginView = null;
			var appView = null;

			showLogin = function () {
				if (loginView === null) {
					console.log("\n\nInstantiating loginView");
					loginView = new controles.views.LoginView(authenticationRepository);
				}
				document.body.appendChild(loginView.render());
				window.loginView = loginView;
				loginView.focus();

				return loginView; // useful for chaining
			};
			showApp = function () {
				if (appView === null) {
					console.log("\n\nInstantiating appView");
					appView = new controles.views.AppView(authenticationRepository);
				}
				document.body.appendChild(appView.render());
				return appView;
			};

			controles.eventbus.on("loggedin", function (user) {
				if (appView === null) {
					console.log("\n\nInstantiating appView 1");
					appView = new controles.views.AppView(authenticationRepository);
				}
				document.body.removeChild(loginView.element());
				showApp();
			});
			controles.eventbus.on("loggedout", function () {
				document.body.removeChild(appView.element());
				showLogin();
			});

			if (!authenticationRepository.isAuthenticated()) {
				console.log("\n\nNOT authenticated!");
//				if (loginView === null) {
//					loginView = new controles.views.LoginView(authenticationRepository);
//				}
				showLogin();
			} else {
//				if (appView === null) {
//					console.log("\n\nInstantiating appView 2");
//					appView = new controles.views.AppView(authenticationRepository);
//				}
				console.log("\n\nAuthenticated!");
				showApp();
			}
		}

	};

}(window.controles = window.controles || {}));
