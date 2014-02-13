/*globals superagent, window, console, alert*/

(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 * @param authenticatedUser
		 * @param specialistsRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ConstateringenRepository(authenticatedUser, specialistsRepository) {
			if (!authenticatedUser) {
				throw new Error("Missing argument 'authenticatedUser.");
			}
			if (!specialistsRepository) {
				throw new Error("Missing argument 'specialistsRepository.");
			}

			var _url = this._dataserverUrl + "/constateringen";
			var _user = authenticatedUser;
			var _controle = null;
			var _specialists = null;
			var FILTER_SEPARATOR = "|";

			
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

			// listen to the state changed event of this repo in order to update the list of specialists
			specialistsRepository.on("stateChanged", function (data) {
				_specialists = data;
			});

			/**
			 * Initialize.
			 */
			this.init = function (controle) {
				specialistsRepository.init();

				_controle = controle;
				this.filter();//{controleId: controle.Id, });
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
				if (!_user) {
					throw new Error("_user object must have value.");
				}
				if (!_controle) {
					throw new Error("_controle object must have value.");
				}

				console.log("\nINSIDE constateringen repo, userFilters: ", userFilters);

				var self = this;
				var url = _url + "?offset=0&limit=" + self.limit;

				//	This filtering is based on:
				//	- controle id
				var filtersQueryString = encodeURIComponent("ControleId") + ":" + encodeURIComponent(encodeURIComponent(_controle.Id));

				//	- optional filters for : 
				// 		-- specialism(s) 
				console.log("\n\n\n\n_user.Specialisms", _user.Specialisms);
				if (_user.Specialisms && _user.Specialisms.length > 0) {
					filtersQueryString += FILTER_SEPARATOR + produceFilterKeyListValue("SpecialismId", _user.Specialisms, "SpecialismId");
				}

				console.log("\nconstateringen userFilters", userFilters);

				// go through optional filters
				// 		-- DatumActiviteit, 
				// 		-- VerantwoordelijkSpecialist

				if (userFilters) {
					Object.keys(userFilters).forEach(function (filterKey) {

						if (filterKey === "fromDate" && userFilters[filterKey] !== null) {
							filtersQueryString += FILTER_SEPARATOR
								+ encodeURIComponent(self.getPropertyFor("Datum Activiteit", self.columnDefinitionList))
								+ ":" + encodeURIComponent(encodeURIComponent(userFilters[filterKey].toISOString()));
						}

						if (filterKey === "specialist" && userFilters[filterKey] !== null) {
							filtersQueryString += FILTER_SEPARATOR
								+ encodeURIComponent(self.getPropertyFor("Specialist", self.columnDefinitionList))
								+ ":" + encodeURIComponent(encodeURIComponent(userFilters[filterKey]));
						}

					});
				}

				console.log("queryString", filtersQueryString);
				if (filtersQueryString) {
					filtersQueryString = "&filters=" + filtersQueryString;
					url += filtersQueryString;
				}

				this._ajaxAgent.get(url, function (res) {
					console.log("\n\nGET ", url + filtersQueryString);

					console.log("res.body", res.body);
					self.state(res.body);
				});
			};

			/**
			 * Full update.
			 * @param constatering
			 */
			this.updateAllProperties = function (constatering) {
				this._ajaxAgent.put(_url + "/" + constatering.Id, constatering, function (res) {
					console.log("res", res);
				});
			};

			/**
			 * Partial update.
			 * @param constatering
			 */
			this.updateStatus = function (constatering) {
				console.log("UPDATE status constatering", constatering);

				// TODOGASL       update   these memebers when changing status
				// StatusId
				// GebruikerId
				// DatumLaatsteMutatue

				this._ajaxAgent.post(_url + "/" + constatering.Id, { StatusId: constatering.StatusId }, function (res) {
					console.log("GET response", res);
				});
			};
		}

		/**
		 * Become a child of the ListRepository object
		 */
		ConstateringenRepository.prototype = new controles.repositories.ListRepository(superagent, controles.URL_DATASERVER);
		/**
		 * Ensure that 'instanceof' will point to the type ConstateringenRepository and not the prototype
		 */
		ConstateringenRepository.prototype.constructor = controles.repositories.ConstateringenRepository;
		/**
		 * The constateringen columns are placed in an Array of zero or more column definition objects
		 *
		 *  Description | Status | Price | Creation Date | Specialist | Id
		 *
		 *  Status int | PatientNr str | ZiektegevalNr str | DatumActiviteit date
		 *  | DBCTypering str | VerantwoordelijkSpecialist str | OverigeKenmerken str | Id int | GebruikersId int
		 *
		 *
		 * @type {Array}
		 */
		ConstateringenRepository.prototype.columnDefinitionList = [
			{
				name: "Specialisme",
				property: "SpecialismId",
				type: "Number",
				options: {
					0: " ",
					1: "Dummy specialism 1",
					2: "Dummy specialism 2",
					3: "Dummy specialism 3",
					4: "Dummy specialism 4",
					5: "Dummy specialism 5",
					6: "Dummy specialism 6",
					7: "Dummy specialism 7",
					8: "Dummy specialism 8",
					9: "Dummy specialism 9",
					10: "Dummy specialism 10"
				},
				editable: {
					control: "crafity.html.Selectbox",
					"default": 2,
					"events": ["selected"]
				}
			},
			{
				name: "Status",
				property: "StatusName", //"StatusId",
				type: "String" //"Number"
			},
			{
				name: "StatusId",
				property: "StatusId",
				type: "Number"
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
				sortable: "descending",
				format: "DD-MM-YYYY"
			},
			{ name: "DBC Typering",
				property: "DBCTypering",
				type: "String"
			},
			{ name: "Specialist",
				property: "VerantwoordelijkSpecialist",
				type: "String"
			},
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