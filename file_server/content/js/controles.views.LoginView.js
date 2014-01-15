/*globals window, console, html, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (controles) {
	"use strict";

	(function (views) {

		var html = crafity.html;

		function LoginView(authenticationRepository) {
			if (!authenticationRepository) {
				throw new Error("Missing argument 'authenticationRepository");
			}
//			var self = this;

			this.addClass("login container");

			var loginDialog = new html.Element("div").addClass("dialog").appendTo(this);
			var icon = new html.Element("div").addClass("symbol stethoscope").appendTo(loginDialog);
			var loginForm = new html.Form().appendTo(loginDialog);
			var usernameField = new html.TextField().label("Gebruiker").addClass("username").required(true).appendTo(loginForm);
			var passwordField = new html.PasswordField().label("Wachtwoord").addClass("password").required(true).appendTo(loginForm);
			var loginButton = new html.Button("login").addClass("symbol submit smaller").appendTo(loginDialog);
			var errorLabel = new html.Element("label").appendTo(loginDialog);

			icon.getElement().innerHTML = "&#xF0F1;";
			loginButton.getElement().innerHTML = "&#xF13E;";

			authenticationRepository.on("loginError", function (err) {
				console.log("\n.on(loginError");
				errorLabel.text(err);
			});

			authenticationRepository.on("loggedout", function () {
				console.log("\n.on(loggedout");
				loginForm.clearFields();
			});
			
			function login() {
				var isValid = loginForm.verify();

				if (isValid) {
					authenticationRepository.login(usernameField.value(), passwordField.value());

//					authenticationRepository.login(usernameField.value(), passwordField.value(), function (err, user) {
//						if (err) {
//							throw err;
//						}
//						self.emit("loggedin", user);
//					});

				} else {
					loginForm.focus();
				}
			}

			loginButton.on("click", login);
			crafity.keyboard.attach(loginForm).on("enter", login);

			this.focus = function () {
				usernameField.focus();
			};
		}

		LoginView.prototype = new html.Element("div");
		views.LoginView = LoginView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));
