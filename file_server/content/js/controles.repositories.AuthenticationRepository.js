/*globals jStorage, superagent, window, console, crafity*/

(function (controles) {
	"use strict";

	(function (repositories) {

		function AuthenticationRepository() {
			var _user = null;

			this.isAuthenticated = function isAuthenticated() {
				return jStorage.get("authenticatedUser") !== null;
			};

			this.authenticatedUser = function authenticatedUser() {
				return jStorage.get("authenticatedUser");
			};

			this.login = function (username, password, callback) {
				var self = this;

				superagent.post(controles.URL_DATASERVER + "/login")
					.type('form')
					.send({ username: username, password: password })
					.end(function (res) {
						console.log("res", res);
						console.log("res.body", res.body);
						console.log("res.error", res.error);

						if (res.error) {
							if (res.body && res.body.status === 404) {
								controles.eventbus.emit("loginError", "Gebruikersnaam of wachtwoord is incorrect.");
							} else if (res.body && res.body.status === 500) {
								controles.eventbus.emit("loginError", "Er is een technische fout opgetreden.");
							} else {
								controles.eventbus.emit("loginError", res.error);
							}

						} else {

							if (res.body.user) {
								_user = res.body.user;
								jStorage.set("authenticatedUser", _user);
								controles.eventbus.emit("loggedin", _user);
							} else {

								controles.eventbus.emit("loginError", new Error("User not found"));
							}

						}
					});

			};

			this.logout = function () {
				jStorage.deleteKey("authenticatedUser");
				_user = null;
				console.log("_user", _user);
				controles.eventbus.emit("loggedout");
			};

		}

		/**
		 * Become a child of the EventEmitter object
		 */
		AuthenticationRepository.prototype = new crafity.core.EventEmitter();
//		/**
//		 * Ensure that 'instanceof' will point to the type UsersRepository and not the prototype
//		 */
//		AuthenticationRepository.prototype.constructor = controles.repositories.AuthenticationRepository;

		/**
		 * Expose to outside callers
		 * @type {AuthenticationRepository}
		 */
		repositories.AuthenticationRepository = AuthenticationRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));


