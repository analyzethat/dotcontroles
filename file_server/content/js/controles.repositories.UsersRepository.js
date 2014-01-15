/*globals superagent, window, console*/

(function (controles) {
	"use strict";

	(function (repositories) {

		function UsersRepository() {
			var URL_DATASERVER = "http://data.dotcontroles.dev";
			var ajaxAgent = superagent;
			var _user = null;

			this.login = function (username, password, callback) {

				superagent.post("http://data.dotcontroles.dev/login")
					.type('form')
					.send({ username: username, password: password })
					.end(function (res) {
						console.log("res.body", res.body);

						if (res.error) {
							callback(res.error, null);

						} else {

							if (res.body.user) {
								_user = res.body.user;
								callback(null, _user);
							} else {
								callback(null, null);
							}

						}
					});

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
//					ajaxAgent
//						.get(URL_DATASERVER + "/users/2")
//						.end(function (res) {
//							if (res.error) {
//								callback(res.error, null);
//							} else {
//								callback(null, res.body);
//							}
//						});

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


