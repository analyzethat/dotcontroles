/*globals superagent, window, console*/

(function (crafity) {
	"use strict";

	(function (controles) {

		function Repository() {
			var URL_DATASERVER = "http://data.dotcontroles.dev";
			var ajaxAgent = superagent;
			var user = null;

			this.login = function (username, password, callback) {
				// test login
				superagent.post("http://data.dotcontroles.dev/login")
					.type('form')
					.send({ username: username, password: password })
					.end(function (res) {
						console.log("AFTER LOGGING res", res);

						if (res.error) {
							callback(res.error, null);
						} else {
							callback(null, res.body);
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
				get: function (callback) {
					ajaxAgent
						.get(URL_DATASERVER + "/users/2")
						.end(function (res) {
							if (res.error) {
								callback(res.error, null);
							} else {
								callback(null, res.body);
							}
						});

				},
				save: function (firstName, lastName) {
					ajaxAgent.post(URL_DATASERVER + "user/" + user.id)
						.send({firstName: firstName, lastName: lastName})
						.end(function (res) {
							console.log("Result from saving user data to database: res", res);
						});
				}
			};

		}

		controles.Repository = Repository;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));


