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
			var loginView = new controles.views.LoginView(authenticationRepository);
			var appView = new controles.views.AppView(authenticationRepository);

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
			
			controles.eventbus.on("loggedin", function (user) {
				document.body.removeChild(loginView.element());
				showApp();
			});
			controles.eventbus.on("loggedout", function () {
				document.body.removeChild(appView.element());
				showLogin();
			});

			if (!authenticationRepository.isAuthenticated()) {
				showLogin();
			} else {
				showApp();
			}
		}
		
	};

}(window.controles = window.controles || {}));
