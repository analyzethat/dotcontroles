/*globals superagent, window, console, crafity*/

(function (controles) {
	"use strict";

	(function (repositories) {

		function AuthenticationRepository() {
			var URL_DATASERVER = "http://data.dotcontroles.dev";
			var _user = null;

			this.login = function (username, password, callback) {
				var self = this;

				superagent.post(URL_DATASERVER + "/login")
					.type('form')
					.send({ username: username, password: password })
					.end(function (res) {
						console.log("res", res);
						console.log("res.body", res.body);
						console.log("res.error", res.error);

						if (res.error) {
							if (res.body && res.body.status === 404) {
								self.emit("loginError", "Gebruikersnaam of wachtwoord is incorrect.");
							} else {

								self.emit("loginError", res.error);
							}

						} else {

							if (res.body.user) {
								_user = res.body.user;
								self.emit("loggedin", _user);
//								callback(null, _user);

							} else {
								self.emit("loginError", new Error("User not found"));
//								callback(null, null);
							}

						}
					});

			};

			this.logout = function () {
				_user = null;
				console.log("_user", _user);
				this.emit("loggedout");
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


