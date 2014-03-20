/*globals jStorage, superagent, window, console, crafity*/

(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 * A repository for performing authentication and delivering the authenticated user data.
		 *
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function AuthenticationRepository() {
			var _user = null;
			var _url = controles.URL_DATASERVER + "/login";

			this.isAuthenticated = function isAuthenticated() {
				return jStorage.get("authenticatedUser") !== null;
			};

			this.authenticatedUser = function authenticatedUser() {
				return jStorage.get("authenticatedUser");
			};

			/**
			 * Ajax call for login with credentials.
			 *
			 * @param username
			 * @param password
			 * @param callback
			 */
			this.login = function (username, password, callback) {
				if (!username) { throw new Error("Missing argument 'username'"); }
				if (!password) { throw new Error("Missing argument 'password'"); }

				var body = { username: username, password: password };

				superagent.post(_url)
					.type('form')
					.send(body)
					.end(function (res) {
						if (config.logger.level > 2) { console.log("\nPOST  url %s, \nreq.body %o \nres.body %o", _url, body, res.body); }

						if (res.error) {
							if (res.body && res.body.status === 404) {
								controles.app.eventbus.emit("loginError", "Gebruikersnaam of wachtwoord is incorrect.");
							}
							else if (res.body && res.body.status === 500) {
								controles.app.eventbus.emit("loginError", "Er is een technische fout opgetreden.");
							}
							else {
								controles.app.eventbus.emit("loginError", res.error);
							}

						}
						else {

							if (res.body.user) {
								_user = res.body.user;
								jStorage.set("authenticatedUser", _user);
								controles.app.eventbus.emit("loggedin", _user);
							}
							else {
								controles.app.eventbus.emit("loginError", new Error("User not found"));
							}

						}
					});

			};

			/**
			 * Ajax call to logout the authenticated user.
			 */
			this.logout = function () {
				jStorage.deleteKey("authenticatedUser");
				_user = null;
				controles.app.eventbus.emit("loggedout");
			};
		}

		/**
		 * Become a child of the EventEmitter object
		 */
		AuthenticationRepository.prototype = new crafity.core.EventEmitter();

		/**
		 * Expose to outside callers
		 * @type {AuthenticationRepository}
		 */
		repositories.AuthenticationRepository = AuthenticationRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));


