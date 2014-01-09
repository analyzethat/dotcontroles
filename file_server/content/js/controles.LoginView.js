/*globals window, console, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (controles) {
	"use strict";

	var html = crafity.html;

	function LoginView(userRepository) {
		var self = this;

		this.addClass("login container");

		var loginDialog = new html.Element("div").addClass("dialog").appendTo(this);
		var icon = new html.Element("div").addClass("symbol stethoscope").appendTo(loginDialog);
		var loginForm = new html.Form().appendTo(loginDialog);
		var usernameField = new html.TextField().label("Gebruiker").addClass("username").required(true).appendTo(loginForm);
		var passwordField = new html.PasswordField().label("Wachtwoord").addClass("password").required(true).appendTo(loginForm);
		var loginButton = new html.Button("login").addClass("symbol submit smaller").appendTo(loginDialog);
		icon.getElement().innerHTML = "&#xF0F1;";
		loginButton.getElement().innerHTML = "&#xF13E;";
	
		loginButton.on("click",function () {

			var isValid = true;
			isValid = usernameField.verify() && isValid;
			isValid = passwordField.verify() && isValid;

			if (isValid) {
				self.emit("loggedin", { username: usernameField.value(), password: passwordField.value() });
			}

		});

		this.focus = function () {
			usernameField.focus();
		};
	}

	LoginView.prototype = new html.Element("div");
	controles.LoginView = LoginView;

}(window.controles = window.controles || {}));
