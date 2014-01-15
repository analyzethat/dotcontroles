/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */

(function (controles) {

	"use strict";

	controles.app = {

		initialize: function () {
			// set the local region
			numeral.language("be-nl");
			moment.lang("nl");

			controles.eventbus = new crafity.core.EventEmitter();
			console.element = document.querySelector(".console");

			var showLogin, showApp;

//			var usersRepository = new controles.repositories.UsersRepository();
			var authenticationRepository = new controles.repositories.AuthenticationRepository();
			var loginView = new controles.views.LoginView(authenticationRepository);
			var appView = new controles.views.AppView(authenticationRepository);

			authenticationRepository.on("loggedin", function () {
				console.log("\n.on(loggedin");
				document.body.removeChild(loginView.getElement());
				showApp();
			});

			authenticationRepository.on("loggedout", function () {
				console.log("\n.on(loggedout");
				document.body.removeChild(appView.getElement());
				showLogin();
			});

			showLogin = function () {
				document.body.appendChild(loginView.render());
				window.loginView = loginView;
				loginView.focus();

				return loginView; // useful for chaining
			};

			showApp = function () {

//				var appView = new controles.views.AppView(authenticationRepository);
//				console.log("\n\nappView: %o, authenticatedUser", appView, authenticatedUser);
				document.body.appendChild(appView.render());

//				appView.on("logout", function () {
//					document.body.removeChild(appView.getElement());
//					showLogin();
//				});

				return appView; // useful for chaining
			};

			showLogin();
			//showApp({});

		}

	};

}(window.controles = window.controles || {}));
