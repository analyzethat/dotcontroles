/*globals superagent, window, console, alert*/

(function (controles) {
	"use strict";

	(function (repositories) {

		function ConstateringenRepository(specialistsRepository) {
			var _specialists = null;
			var _url = this._dataserverUrl + "/constateringen";
			var _controle = null;

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
				this.filter({controleId: controle.Id});
			};

			/**
			 * Filter constateringen.
			 *
			 * @example
			 * this.filter({controleId: controle.Id});
			 *
			 * @param filters
			 */
			this.filter = function (filters) {
				if (!filters) {
					throw new Error("Missing argument filters.");
				}

				var self = this;
				var url = _url + "?offset=0&limit=" + self.limit;
				var filtersQueryString = ""; // a falsy value => can check against !value

				// gather all filters and combine with the logical AND operator
				if (!filters.controleId) {
					filters.controleId = _controle.Id;
				}
				console.log("filters", filters);
				
				Object.keys(filters).forEach(function (filterKey) {

					if (filterKey === "controleId" && filters[filterKey] !== null) {
						console.log("filters[filterKey]", filters[filterKey]);

						filtersQueryString += (filtersQueryString ? "," : "")
							+ encodeURIComponent("ControleId")
							+ ":" + encodeURIComponent(encodeURIComponent(filters[filterKey]));
					}

					if (filterKey === "fromDate" && filters[filterKey] !== null) {
						console.log("filters[filterKey]", filters[filterKey]);

						filtersQueryString += (filtersQueryString ? "," : "")
							+ encodeURIComponent(self.getPropertyFor("Datum Activiteit", self.columnDefinitionList))
							+ ":" + encodeURIComponent(encodeURIComponent(filters[filterKey].toISOString()));
					}

					if (filterKey === "specialist" && filters[filterKey] !== null) {
						filtersQueryString += (filtersQueryString ? "," : "")
							+ encodeURIComponent(self.getPropertyFor("Specialist", self.columnDefinitionList))
							+ ":" + encodeURIComponent(encodeURIComponent(filters[filterKey]));
					}

				});

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
				this._ajaxAgent.post(_url + "/" + constatering.Id, { StatusId: constatering.StatusId }, function (res) {
					console.log("GET response", res);
				});
			};
		}

		/**
		 * Become a child of the ListRepository object
		 */
		ConstateringenRepository.prototype = new controles.repositories.ListRepository(superagent, repositories.URL_DATASERVER);
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
				name: "Status",
				property: "StatusId",
				type: "Number",
				options: {
					0: " ",
					1: "Open",
					2: "Status 2",
					3: "Status 3",
					4: "Status 4",
					5: "Status 5",
					6: "Doorgezet"
				},
				editable: {
					control: "crafity.html.Selectbox",
					"default": 2,
					"events": ["selected"]
				}
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