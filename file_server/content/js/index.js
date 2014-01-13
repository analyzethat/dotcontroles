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

			// BEGIN only for testing purposes
			window.getUser = function () {
				// test login
				superagent
					.get("http://data.dotcontroles.dev/user/1")
					.end(function (res) {
						console.log(res);
					});
			};

			showLogin = function () {
				var loginView = new controles.LoginView();
				console.log("loginView", loginView);
				document.body.appendChild(loginView.render());
				window.loginView = loginView;
				loginView.focus();
				loginView.on("loggedin", function (user) {
					document.body.removeChild(loginView.getElement());
					showApp(user);
				});
				return loginView;
			};

			showApp = function (user) {
				var appView = new controles.AppView();
				console.log("appView", appView, user);
				document.body.appendChild(appView.render());
				appView.on("logout", function () {
					document.body.removeChild(appView.getElement());
					showLogin();
				});
				return appView;
			};

			//showLogin();
			showApp({});

		}

	};

}(window.controles = window.controles || {}));
