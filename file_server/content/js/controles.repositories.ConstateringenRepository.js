/*globals superagent, window, console, alert*/

(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 * Constatergingen repository.
		 *
		 * @param authenticatedUser
		 * @param specialistsRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ConstateringenRepository(authenticatedUser, specialistsRepository) {
			if (!authenticatedUser) { throw new Error("Missing argument 'authenticatedUser'."); }
			if (!specialistsRepository) { throw new Error("Missing argument 'specialistsRepository'."); }

            var self = this;
			var _url = this._dataserverUrl + "/constateringen";
			var _user = authenticatedUser;
			var _controle = null;
			var _specialists = null;
			//var _specialismList = specialismList;
			//var _statusList = statusList;
            //controleHeader[0].options = _specialismList; // fills options property of first element of columndefinitionlist
            //controleHeader[1].options = _statusList; // fills options property of element of columndefinitionlist
           // var columnDefinitionList = columnDefinitionList2;
            //console.log(columnDefinitionList);
			var _userFilters = {
				fromDate: null,
				specialist: null,
				sortBy: null,
				sortOrder: null
			};

			var FILTER_SEPARATOR = "|";



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

			specialistsRepository.on("stateChanged", function (data) {
				_specialists = data;
			});

			/**
			 * Get all user roles.
			 * @returns {body.user.Roles}
			 */
			this.getUserRoles = function () {
				return _user.Roles;
			};

			/**
			 * Initialize.
			 *
			 * @param controle
			 */
			this.init = function (controle) {
				specialistsRepository.init();
                _controle = controle;
				this.filter();
			};

			/**
			 * Filter constateringen.
			 *
			 * @example
			 * this.filter({fromDate: controle.Id});
			 *
			 * @param userFilters
			 */
			this.filter = function (userFilters) {
				if (!_user) { throw new Error("_user object must have value."); }
				if (!_controle) { throw new Error("_controle object must have value."); }

				var self = this;
				var url = _url + "?offset=0&limit=" + self.limit;

				updateUserFilters(userFilters);

				// Constateringen are filtered by:
				//	1. the system:
				//	1.1 controle id
				var filtersQueryString = encodeURIComponent("ControleId") + ":" + encodeURIComponent(encodeURIComponent(_controle.Id));

				//	1.2 [optionally] specialism ids
				if (_user.Specialisms && _user.Specialisms.length > 0) {
					filtersQueryString += FILTER_SEPARATOR + produceFilterKeyListValue("SpecialismId", _user.Specialisms, "SpecialismId");
				}

				// 2. and the user
				if (_userFilters) {
					Object.keys(_userFilters).forEach(function (filterKey) {
						if (filterKey === "fromDate" && _userFilters[filterKey] !== null) {
							filtersQueryString += FILTER_SEPARATOR
								+ encodeURIComponent(self.getPropertyFor("Datum Activiteit", self.columnDefinitionList))
								+ ":" + encodeURIComponent(encodeURIComponent(_userFilters[filterKey].toISOString()));
						}
						if (filterKey === "specialist" && _userFilters[filterKey] !== null) {
							filtersQueryString += FILTER_SEPARATOR
								+ encodeURIComponent(self.getPropertyFor("Specialist", self.columnDefinitionList))
								+ ":" + encodeURIComponent(encodeURIComponent(_userFilters[filterKey]));
						}
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
					if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", url, res.body); }
					self.state(res.body);
				});
			};

			/**
			 * Full update.
			 *
			 * @param constatering
			 */
			this.updateAllProperties = function (constatering) {
				this._ajaxAgent.put(_url + "/" + constatering.Id, constatering, function (res) {
					if (config.logger.level > 2) { console.log("res", res); }
				});
			};



			/**
			 * Partial update.
			 *
			 * @param constatering
			 */
			this.assignToSpecialism = function (specialismId, constatering) {
				// Memebers to update when changing specialism:
				// StatusId, UserId, DatumLaatsteMutatue

				var body = {
					SpecialismId: specialismId,
					StatusId: 5, // sega TODOgasl - make this not hard coded => load the option lists / stam tabellen in the begin of the app
					UserId: _user.Id,
					LastMutationDate: (new Date()).toISOString()
				};

				this._ajaxAgent.post(_url + "/" + constatering.Id, body, function (res) {
					var updateSuccsesful = res.body.SpecialismId === body.SpecialismId
						&& res.body.StatusId === body.StatusId
						&& res.body.UserId === body.UserId
						&& res.body.LastMutationDate === body.LastMutationDate;

					self.filter(_userFilters);
				});
			};

			/**
			 * Modify status of this constatering.
			 * @param statusId
			 * @param constatering
			 */
			this.changeStatus = function (statusId, constatering) {
				var body = {
					StatusId: statusId,
					UserId: _user.Id,
					LastMutationDate: (new Date()).toISOString()
				};

				this._ajaxAgent.post(_url + "/" + constatering.Id, body, function (res) {

					self.filter(_userFilters);
				});
			};
		}

		/**
		 * Become a child of the ListRepository object.
		 */
		ConstateringenRepository.prototype = new controles.repositories.ListRepository(superagent, controles.URL_DATASERVER);
		/**
		 * Ensure that 'instanceof' will point to the type ConstateringenRepository and not the prototype
		 */
		ConstateringenRepository.prototype.constructor = controles.repositories.ConstateringenRepository;
		/**
		 * The column definition list targets the GUI presentation of the html Grid columns.
		 *
		 * @type {Array}
		 */


		ConstateringenRepository.prototype.columnDefinitionList2 = [
			{
				name: "Eigenaar",
				property: "SpecialismId",
				type: "Number",
				options: null,
				editable: {
					control: "crafity.html.Selectbox",
					"default": 2,
					"events": [
						{ selected: "selectedSpecialism" }
					]
				},
				sortable: "none"
			},
			{
				name: "Naar Status",
				property: "StatusId",
				type: "Number",
				options: null,
				editable: {
					control: "crafity.html.Selectbox",
					"default": 4,
					"events": [
						{ selected: "selectedStatus" }
					]
				}
			},
			{
				name: "Laatste Mutatie",
				property: "LastMutationDate",
				type: "Date",
				sortable: "none",
				format: "DD-MM-YYYY"
			},
			{ name: "Patientnummer",
				property: "PatientNr",
				type: "String"
			},
			{ name: "Ziektegeval",
				property: "ZiektegevalNr",
				type: "Number"
			},
			{ name: "Datum Activiteit",
				property: "DatumActiviteit",
				type: "Date",
				sortable: "none",
				format: "DD-MM-YYYY"
			},
			{ name: "DBC Typering",
				property: "DBCTypering",
				type: "String"
			},
			{ name: "Specialist",
				property: "VerantwoordelijkSpecialist",
				type: "String",
				sortable: "none"
			}
			,
			{ name: "Overige kenmerken",
				property: "OverigeKenmerken",
				type: "String"
			}
		];

		/**
		 * Expose to outside callers
		 * @type {ConstateringenRepository}
		 */
		repositories.ConstateringenRepository = ConstateringenRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));