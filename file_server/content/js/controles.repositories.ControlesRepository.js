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
			if (!authenticatedUser) { throw new Error("Missing argument 'authenticatedUser'."); }

			var _url = this._dataserverUrl + "/controles";
			var _user = authenticatedUser;
			var _userFilters = {
						sortBy: null,
						sortOrder: null
					};
			
			var FILTER_SEPARATOR = "|";

			/* Auxiliary methods */
			function updateUserFilters(userFilters) {
					if (!userFilters) return;
	
					if (!_userFilters || _userFilters === null) { throw new Error("_userFilters is not defined or has no value."); }
					if (!Object.keys(_userFilters) || Object.keys(_userFilters).length === 0) {
						throw new Error("_userFilters is missing members.");
					}
	
					Object.keys(userFilters).forEach(function (key) {
						_userFilters[key] = userFilters[key];
					});
				}
			
			function produceFilterKeyListValue(key, valueArray, id) {
				if (!key) { throw new Error("Missing argument 'key'"); }
				if (!valueArray || valueArray.length === 0) { throw new Error("Missing argument 'valueArray'"); }

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
			 * Get the roles of the authenticated user.
			 * @returns {body.user.Roles|*}
			 */
			this.getUserRoles = function () {
				return _user.Roles;
			};

			/**
			 * Initialize.
			 */
			this.init = function () {
				this.filter();
			};

			/**
			 * Ajax call for filtered controle list.
			 */
			this.filter = function (userFilters) {
				if (!_user) { throw new Error("User is not instantiated."); }

				var self = this;
				var url = _url + "?offset=0&limit=" + self.limit;

				updateUserFilters(userFilters);

				
				var filtersQueryString = produceFilterKeyListValue("FunctionalRoleId", _user.Roles, "FunctionalRoleId");

				if (_user.Specialisms && _user.Specialisms.length > 0) {
					filtersQueryString += FILTER_SEPARATOR + produceFilterKeyListValue("SpecialismId", _user.Specialisms, "SpecialismId");
				}

				
				// 2. and the user
				if (_userFilters) {
					Object.keys(_userFilters).forEach(function (filterKey) {
						if (filterKey === "sortBy" && _userFilters[filterKey] !== null) {
							filtersQueryString += FILTER_SEPARATOR
								+ encodeURIComponent(filterKey)
								+ ":" + encodeURIComponent(encodeURIComponent(_userFilters[filterKey]));
						}
						if (filterKey === "sortOrder" && _userFilters[filterKey] !== null) {
							filtersQueryString += FILTER_SEPARATOR
								+ encodeURIComponent(filterKey)
								+ ":" + encodeURIComponent(encodeURIComponent(_userFilters[filterKey]));
						}
					});
				}
				
				if (filtersQueryString) {
					filtersQueryString = "&filters=" + filtersQueryString;
					url += filtersQueryString;
				}

				this._ajaxAgent.get(url, function (res) {
					if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", _url, res.body); }
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
		 * The column definition list targets the GUI presentation of the html Grid columns.
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
				sortable: "none"
			},
			{ name: "Type",
				property: "Type",
				type: "String",
				sortable: "none"
			},
			{ name: "Rol",
				property: "RoleName",
				type: "String"
			},
			{ name: "Constateringen",
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