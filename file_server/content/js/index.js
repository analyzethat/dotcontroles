/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */
"use strict";

var appContainer;

var app = {
	initialize: function () {
		// set the local region
		numeral.language("be-nl");
		moment.lang("nl");

		console.element = document.querySelector(".console");

		// BEGIN only for testing purposes
		window.getUser = function () {
			// test login
			superagent
				.get("http://data.dotcontroles.dev/user/1")
				.end(function (res) {
					console.log(res);
				});
		};

		function showLogin() {
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
		}
		
		function showApp(user) {
			var appView = new controles.AppView();
			console.log("appView", appView);
			document.body.appendChild(appView.render());
			appView.on("logout", function () {
				document.body.removeChild(appView.getElement());
				showLogin();
			});			
			return appView;
		}
		
		//showLogin();
		showApp();
		
//		var loginView = new controles.LoginView();
//		var appView = new controles.AppView();
//		appView.render();
//		
//		document.body.appendChild(loginView.render());
//
//		loginView.on("loggedin", function (user) {
//
//			// Remove login view
//			document.body.removeChild(loginView.getElement());
//
//			// Show the main application
//			document.body.appendChild(appView.getElement());
//			
//			appView.on("logout", function () {
//				document.body.removeChild(appView.getElement());
//				document.body.appendChild(loginView.getElement());
//				
//			});
//		});

	}
};

var console1 = {
	console: window.console,
	element: null,
	log: function () {
		var args = Array.prototype.slice.call(arguments);
		args.forEach(function (arg) {
			console.element.innerText += arg.toString() + " ";
		});
		console.element.innerText += "\n";
	}
};
