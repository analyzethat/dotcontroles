/*globals superagent, window, console*/

(function (controles) {
	"use strict";

	(function (repositories) {

		function ControlesRepository(authenticatedUser) {
			var _url = this._dataserverUrl + "/controles";
			var _user = authenticatedUser;
			var self = this;
			
			controles.eventbus.on("loggedout", function () {
				_user = null;
			});

			this.init = function () {
				if (!_user) {
					throw new Error("User is not instantiated.");
				}

				console.log("\n\n\n_user", _user);
				var filtersQueryString = encodeURIComponent("RoleIds:[");

				var first = true;
				_user.Roles.forEach(function (role) {
					filtersQueryString += (first ? "": ",")
						+ encodeURIComponent(encodeURIComponent(role.FunctionalRoleId));
					first = false;
				});
				filtersQueryString += encodeURIComponent("]");
				
				var filters = "&filters=" + filtersQueryString;
				console.log("\n\n controle roles", filters);

				this._ajaxAgent.get(_url + "?offset=0&limit=" + self.limit + filters, function (res) {
					console.log("\nGET  %s  , res.body", _url, res.body);
					self.state(res.body);
				});
			};
		}

		/**
		 * Become a child of the ListRepository object
		 */
		ControlesRepository.prototype = new controles.repositories.ListRepository(superagent, repositories.URL_DATASERVER);
		/**
		 * Ensure that 'instanceof' will point to the type ControlesRepository and not the prototype
		 */
		ControlesRepository.prototype.constructor = controles.repositories.ControlesRepository;
		/**
		 * The controles columns are placed in an Array of zero or more column definition objects
		 *
		 *  Code | Name | Type
		 *
		 * @type {Array}
		 */
		ControlesRepository.prototype.columnDefinitionList = [
			{
				name: "Code",
				property: "Code",
				type: "String"
			},
			{ name: "Naam",
				property: "Name",
				type: "String"
			},
			{ name: "Type",
				property: "Type",
				type: "String"
			},
			{ name: "Rol",
				property: "RoleId",
				type: "Number"
			},
			{ name: "Aantal Constateringen",
				property: "NumberOfConstateringen",
				type: "Number"
			}
		];

		/**
		 * Expose to outside callers
		 * @type {ConstateringenRepository}
		 */
		repositories.ControlesRepository = ControlesRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));