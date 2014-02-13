/*globals superagent, window, console*/

(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 *
		 * @param authenticatedUser
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ControlesRepository(authenticatedUser) {
			var _url = this._dataserverUrl + "/controles";
			var _user = authenticatedUser;
			var self = this;

			var FILTER_SEPARATOR = "|";
			
			controles.eventbus.on("loggedout", function () {
				_user = null;
			});

			// TODOgasl duplicate method - put in base object functionality 
			function produceFilterKeyListValue(key, valueArray, id) {
				var filtersQueryString = encodeURIComponent(key + ":[");

				var first1 = true;
				valueArray.forEach(function (value) {
					filtersQueryString += (first1 ? "" : ",")
						+ encodeURIComponent(encodeURIComponent(value[id]));
					first1 = false;
				});

				filtersQueryString += encodeURIComponent("]");
				return filtersQueryString;
			}

			this.init = function () {
				if (!_user) {
					throw new Error("User is not instantiated.");
				}

				console.log("\n\n\n_user", _user);

				var filtersQueryString = produceFilterKeyListValue("RoleId", _user.Roles, "FunctionalRoleId");

				console.log("\n\n\n\n_user.Specialisms", _user.Specialisms);
				if (_user.Specialisms && _user.Specialisms.length > 0) {
					filtersQueryString += FILTER_SEPARATOR + produceFilterKeyListValue("SpecialismId", _user.Specialisms, "SpecialismId");
				}

				var filters = "&filters=" + filtersQueryString;
//				console.log("\n\n controle roles", filters);

				this._ajaxAgent.get(_url + "?offset=0&limit=" + self.limit + filters, function (res) {
					console.log("\nGET  %s  , res.body", _url, res.body);
					self.state(res.body);
				});
			};
		}

		/**
		 * Become a child of the ListRepository object
		 */
		ControlesRepository.prototype = new controles.repositories.ListRepository(superagent, controles.URL_DATASERVER);
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
				property: "RoleName", //"RoleId",
				type: "String"
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