/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles, $ */
(function (controles) {
	"use strict";

	controles.URL_DATASERVER = "http://data." + document.location.host;

	/**
	 * Entry point of DOT controles client.
	 *
	 * @type {{initialize: initialize}}
	 */
	controles.app = (function () {
		
		var loginView = null;
		var appView = null;
		var authenticationRepository = null;

		return {
			eventbus: null,

			initialize: function () {
				console.log("\n\nInitialize objects..");
				
				numeral.language("be-nl");
				moment.lang("nl");

				window.jStorage = window.jStorage || $.jStorage.noConflict();
				authenticationRepository = new controles.repositories.AuthenticationRepository();
				console.element = document.querySelector(".console");
				controles.app.eventbus = new crafity.core.EventEmitter();

				// auxiliary methods
				function showLogin() {
					if (loginView === null) {
						loginView = new controles.views.LoginView(authenticationRepository);
					}
					document.body.appendChild(loginView.render());
					window.loginView = loginView;
					loginView.focus();

					return loginView; // useful for chaining
				}
				function showApp() {
					if (appView === null) {
						appView = new controles.views.AppView(authenticationRepository);
					}
					document.body.appendChild(appView.render());
					return appView;
				}

				// event handlers
				controles.app.eventbus.on("loggedin", function loggedin(user) {
					if (appView === null) {
						appView = new controles.views.AppView(authenticationRepository);
					}
					document.body.removeChild(loginView.element());
					showApp();
				});
				controles.app.eventbus.on("loggedout", function loggedout() {
					document.body.removeChild(appView.element());
					controles.app.destroy();
					controles.app.initialize();
				});

				if (!authenticationRepository.isAuthenticated()) {
					console.log("\n\nNOT authenticated!");
					showLogin();
				} else {
					console.log("\n\nAuthenticated!");
					showApp();
				}
			},

			destroy: function () {
				console.log("\n\nDestroy objects..");
				loginView = null;
				appView = null;
				authenticationRepository = null;
				controles.app.eventbus = null;
				crafity.keyboard.removeAllListeners();
			}
		};
		
	}());

}(window.controles = window.controles || {}));
