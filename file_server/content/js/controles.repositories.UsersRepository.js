/*globals superagent, window, console*/

(function (controles) {
	"use strict";

	(function (repositories) {

		function UsersRepository(URL_DATASERVER) {
//			var URL_DATASERVER = "http://data.dotcontroles.dev";
			var ajaxAgent = superagent;
			var _authenticatedUser = null;
			var _user = null;

			/**
			 * A getter / setter function to keep the logged in user.
			 * @param user
			 * @returns {*}
			 */
			this.authenticatedUser = function (user) {
				if (!user) {
					throw new Error("Expected argument 'user'");
				}

				if (user == null) {
					return _authenticatedUser;
				}
				_authenticatedUser = user;
				controles.eventbus.emit("authenticated", _authenticatedUser);
				
				return this;
//				console.log("_authenticatedUser", _authenticatedUser);
			};

			this.users = {
				get: function (callback) {
					ajaxAgent
						.get(URL_DATASERVER + "users")
						.end(function (res) {
							if (res.error) {
								callback(res.error, null);
							} else {
								callback(null, res.body);
							}
						});
				}
			};

			this.user = {
				get: function () {
					if (!_user) {
						return _user;
					}
				},

				save: function (firstName, lastName) {
					ajaxAgent.post(URL_DATASERVER + "user/" + _user.id)
						.send({firstName: firstName, lastName: lastName})
						.end(function (res) {
							console.log("Result from saving user data to database: res", res);
						});
				}
			};

		}

		/**
		 * Become a child of the ListRepository object
		 */
		UsersRepository.prototype = new controles.repositories.ListRepository(superagent, repositories.URL_DATASERVER);
		/**
		 * Ensure that 'instanceof' will point to the type UsersRepository and not the prototype
		 */
		UsersRepository.prototype.constructor = controles.repositories.ConstateringenRepository;

		/**
		 * Expose to outside callers
		 * @type {ConstateringenRepository}
		 */
		repositories.UsersRepository = UsersRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));


