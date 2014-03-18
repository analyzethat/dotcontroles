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
			var FILTER_SEPARATOR = "|";

			// TODOgasl duplicate method - put in base object functionality 
			/* Auxiliary methods */
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
			/* End auxiliary methods */
			
			/**
			 * Initialize.
			 */
			this.init = function () {
				if (!_user) { throw new Error("User is not instantiated."); }

				var self = this;
				var url = _url + "?offset=0&limit=" + self.limit;

				var filtersQueryString = produceFilterKeyListValue("FunctionalRoleId", _user.Roles, "FunctionalRoleId");

				if (_user.Specialisms && _user.Specialisms.length > 0) {
					filtersQueryString += FILTER_SEPARATOR + produceFilterKeyListValue("SpecialismId", _user.Specialisms, "SpecialismId");
				}

				if (filtersQueryString) {
					filtersQueryString = "&filters=" + filtersQueryString;
					url += filtersQueryString;
				}

				this._ajaxAgent.get(url, function (res) {
					console.log("\nGET  '%s', res.body", _url, res.body);
					self.state(res.body);
				});
			};

			this.getUserRoles = function () {
				return _user.Roles;
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
				type: "String",
				sortable: "ascending"
			},
			{ name: "Naam",
				property: "Name",
				type: "String",
				sortable: "ascending"
			},
			{ name: "Type",
				property: "Type",
				type: "String"
			},
			{ name: "Rol",
				property: "RoleName",
				type: "String",
				sortable: "ascending"
			},
			{ name: "Constateringen",
				property: "NumberOfConstateringen",
				type: "Number",
				sortable: "descending"
			}
		];

		/**
		 * Expose to outside callers
		 * @type {ConstateringenRepository}
		 */
		repositories.ControlesRepository = ControlesRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));