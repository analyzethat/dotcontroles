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

			// user filters:
			//
			// fromDate
			// specialist
			// sortBy 
			// sortOrder
			var _userFilters = {
				fromDate: null,
				specialist: null,
				sortBy: null,
				sortOrder: null
			};

			var FILTER_SEPARATOR = "|";

			function updateUserFilters(userFilters) {
				if (!userFilters) {
					return;
				}
				if (!_userFilters || _userFilters == null) {
					throw new Error("_userFilters is not defined or has no value.");
				}
				if (!Object.keys(_userFilters) || Object.keys(_userFilters).length === 0) {
					throw new Error("_userFilters is missing members.");
				}

				console.log("\nuserFilters: ", userFilters);
				console.log("\n_userFilters BEFORE: ", _userFilters);
				
				Object.keys(userFilters).forEach(function (key) {
					_userFilters[key] = userFilters[key];
				});
				console.log("\n_userFilters AFTER: ", _userFilters);
			}

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

				updateUserFilters(userFilters);

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

						//{"sortBy": e.column.property, "sortOrder": e.order }
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
				// Memebers to update when changing specialism:
				// StatusId, UserId, DatumLaatsteMutatue

				var body = {
					SpecialismId: specialismId,
					StatusId: 5, // TODO gasl - make this not hard coded => load the option lists / stam tabellen in the begin of the app
					UserId: _user.Id,
					LastMutationDate: (new Date()).toISOString()
				};

				console.log("\n Values to change!!!");
				console.log("\n SpecialismId ", body.SpecialismId);
				console.log("\n StatusId: ", body.StatusId);
				console.log("\n UserId: ", body.UserId);
				console.log("\n LastMutationDate: ", body.LastMutationDate);

				this._ajaxAgent.post(_url + "/" + constatering.Id, body, function (res) {
					console.log("\nNB response", res.body);

					console.log(res.body.SpecialismId, body.SpecialismId);
					console.log(res.body.SpecialismId === body.SpecialismId);
					console.log(res.body.StatusId, body.StatusId);
					console.log(res.body.UserId, body.UserId);
					console.log(res.body.LastMutationDate, body.LastMutationDate);

					var updateSuccsesful = res.body.SpecialismId === body.SpecialismId
						&& res.body.StatusId === body.StatusId
						&& res.body.UserId === body.UserId
						&& res.body.LastMutationDate === body.LastMutationDate;

					console.log("\nNB! updateSuccesful", updateSuccsesful);

					self.filter(_userFilters);
				});
			};

			this.changeStatus = function (statusId, constatering) {
				var body = {
					StatusId: statusId,
					UserId: _user.Id,
					LastMutationDate: (new Date()).toISOString()
				};

				this._ajaxAgent.post(_url + "/" + constatering.Id, body, function (res) {
					console.log("\nNB response", res.body);

					console.log(res.body.StatusId, body.StatusId);
					console.log(res.body.StatusId === body.StatusId);
					console.log(res.body.UserId, body.UserId);
					console.log(res.body.LastMutationDate, body.LastMutationDate);

					var updateSuccsesful = res.body.StatusId === body.StatusId
						&& res.body.UserId === body.UserId
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
				name: "Afh. Specialisme",
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
					"events": [
						{ selected: "selectedSpecialism" }
					]
				},
				sortable: "ascending"
			},
			{
				name: "Status",
				property: "StatusId",
				type: "Number",
				sortable: "ascending",
				options: {
					1: "Open",
					2: "Negeren",
					4: "Afgehandeld",
					5: "Doorgezet"
				},
				editable: {
					control: "crafity.html.Selectbox",
					"default": 1,
					"events": [
						{selected: "selectedStatus" }
					]
				}
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
				type: "String",
				sortable: "ascending"
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

	}

		(controles.repositories = controles.repositories || {})
		)
	;

}(window.controles = window.controles || {}));