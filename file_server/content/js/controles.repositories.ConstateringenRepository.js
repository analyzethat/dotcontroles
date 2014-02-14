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
			if (!authenticatedUser) {
				throw new Error("Missing argument 'authenticatedUser.");
			}
			if (!specialistsRepository) {
				throw new Error("Missing argument 'specialistsRepository.");
			}

			var self = this;
			var _url = this._dataserverUrl + "/constateringen";
			var _user = authenticatedUser;
			var _controle = null;
			var _specialists = null;
			var _userFilters = null;
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

			this.getUserRoles = function () {
				console.log("\n\n_user.Roles", _user.Roles);
				return _user.Roles;
			};

			/**
			 * Initialize.
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
				if (!_user) {
					throw new Error("_user object must have value.");
				}
				if (!_controle) {
					throw new Error("_controle object must have value.");
				}

				_userFilters = userFilters;

				console.log("\nINSIDE constateringen repo, userFilters: ", userFilters);

				var self = this;
				var url = _url + "?offset=0&limit=" + self.limit;

				//	This filtering is based on:
				//	- controle id
				var filtersQueryString = encodeURIComponent("ControleId") + ":" + encodeURIComponent(encodeURIComponent(_controle.Id));

				//	- optional filters for : 
				// 		-- specialism(s) 
				if (_user.Specialisms && _user.Specialisms.length > 0) {
					filtersQueryString += FILTER_SEPARATOR + produceFilterKeyListValue("SpecialismId", _user.Specialisms, "SpecialismId");
				}

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

				if (filtersQueryString) {
					filtersQueryString = "&filters=" + filtersQueryString;
					url += filtersQueryString;
				}

				this._ajaxAgent.get(url, function (res) {
					console.log("\n\nGET ", url);

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
			this.assignToSpecialism = function (specialismId, constatering) {
				console.log("Change 'afhandelend specialisme' on constatering", constatering);

				// Memebers to update when changing specialism:
				// StatusId
				// GebruikerId
				// DatumLaatsteMutatue

				var body = {
					SpecialismId: specialismId,
					StatusId: 5,
					GebruikerId: _user.Id,
					LastMutationDate: (new Date()).toISOString()
				};

				// TODOgasl - change in table Constateringen column name from GebruikerId to UserId
				console.log("\n Values to change!!!");
				console.log("\n SpecialismId ", body.SpecialismId);
				console.log("\n StatusId: ", body.StatusId);
				console.log("\n GebruikerId: ", body.GebruikerId);
				console.log("\n LastMutationDate: ", body.LastMutationDate);

				this._ajaxAgent.post(_url + "/" + constatering.Id, body, function (res) {
					console.log("\nNB response", res.body);

					console.log(res.body.SpecialismId, body.SpecialismId);         
					console.log(res.body.SpecialismId === body.SpecialismId);         
					console.log(res.body.StatusId,body.StatusId);                 
					console.log(res.body.GebruikerId,body.GebruikerId);           
					console.log(res.body.LastMutationDate,body.LastMutationDate);
					
					var updateSuccsesful = res.body.SpecialismId === body.SpecialismId
															&& res.body.StatusId === body.StatusId
															&& res.body.GebruikerId === body.GebruikerId
															&& res.body.LastMutationDate === body.LastMutationDate;

					console.log("\nNB! updateSuccesful", updateSuccsesful);

					self.filter(_userFilters);
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
				name: "Afhandelend Specialisme",
				property: "SpecialismId",
				type: "Number",
				options: {
					0: " ",
					1: "Oogheelkunde",
					2: "KNO",
					3: "Heelkunde",
					4: "Plastische chirurgi",
					5: "Orthopedie",
					6: "Urologie",
					7: "Gynaecologie",
					8: "Neurochirurgie",
					9: "Dermatologie",
					10: "Inwendige Geneeskunde",
					11: "Kindergeneeskunde Algemeen",
					12: "Kindergeneeskunde Neonatologie",
					13: "Maag-, Darm-, en Leverziekten",
					14: "Cardiologie",
					15: "Longgeneeskunde",
					16: "Reumatologie",
					17: "Allergologie",
					18: "Revalidatiegeneeskunde",
					19: "Cardio-pulmonale chirurgie",
					20: "Consultatieve Psychiatrie",
					21: "Neurologie",
					22: "Klinische Geriatrie",
					23: "Radiotherapie",
					24: "Radiologie",
					25: "Anesthesiologie",
					26: "Klinische Genetica",
					27: "Audiologie"
				},
				editable: {
					control: "crafity.html.Selectbox",
					"default": 2,
					"events": ["selected"]
				}
			},
			{
				name: "Status",
				property: "StatusName",
				type: "String"
			},
			{
				name: "Laatste Mutatie",
				property: "LastMutationDate",
				type: "Date",
				sortable: "descending",
				format: "DD-MM-YYYY"
			},
//			{
//				name: "StatusId",
//				property: "StatusId",
//				type: "Number"
//			},
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