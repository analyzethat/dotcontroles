/*globals alert, superagent, window, console*/

(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 * User repository.
		 *
		 * @param authenticatedUser
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function UsersRepository(authenticatedUser) {
			var _authenticatedUser = authenticatedUser;
			var self = this;
			//var _url = this._dataserverUrl + "/users";

			/**
			 * A getter / setter function to keep the logged in user.
			 * @param user
			 * @returns {*}
			 */
			this.authenticatedUser = function () {
				return _authenticatedUser;
			};

			//			this.users = {
			//				get: function (callback) {
			//					self._ajaxAgent
			//						.get(_url)
			//						.end(function (res) {
			//							if (res.error) {
			//								callback(res.error, null);
			//							} else {
			//								callback(null, res.body);
			//							}
			//						});
			//				}
			//			};

			this.saveContactData = function (firstName, lastName, email) {
				self._ajaxAgent.post(self._dataserverUrl + "user/" + _authenticatedUser.id)
					.send({firstName: firstName, lastName: lastName, email: email})
					.end(function (res) {
						if (config.logger.level > 2) { console.log("\n\n\nResult from saving user data to database: res", res); }
					});
			};
		}

		/**
		 * Become a child of the ListRepository object
		 */
		UsersRepository.prototype = new controles.repositories.ListRepository(superagent, controles.URL_DATASERVER);
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