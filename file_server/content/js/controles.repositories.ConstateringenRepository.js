/*globals superagent, window, console*/

(function (controles) {
	"use strict";
	
	(function (repositories) {

		function ConstateringenRepository(ajaxAgent, dataserverUrl, specialistsRepository) {
			if (!dataserverUrl) {
				throw new Error("Expected a 'dataserverUrl' argument");
			}
			if (!ajaxAgent) {
				throw new Error("Expected a 'ajaxAgent' argument");
			}

			var self = this;
			var columnDefinitionList = null;
			var _specialists = null;
			var state;

			function setState(data) {
				state = data;
				self.emit('data', state.items);
				self.emit('stateChanged', state);
			}

			function getPropertyFor(name) {
				var res = null;
				res = self.columnDefinitionList
					.filter(function (colDefinition, index) {
						return (name === colDefinition.name);
					})
					.map(function (colDefinition, index) {
						if (name === colDefinition.name) {
							return colDefinition.property;
						}
					});

				if (res.length > 2) {
					throw new Error("Multiple properties were found for name " + name);
				}

				return (res && res.length > 0) ? res[0] : null;
			}

			// listen to the state changed event of this repo in order to update the list of specialists
			specialistsRepository.on("stateChanged", function (data) {
				_specialists = data;
			});

			function updateProperties(id, properties) {
				console.log("properties", properties);
				ajaxAgent.post(dataserverUrl + "/constateringen/" + id, properties, function (res) {
					console.log("response", res);
				});
			}

			this.hasPrevious = function () {
				return state.previous !== null;
			};
			this.hasNext = function () {
				return state.next !== null;
			};

			this.first = function () {
				ajaxAgent.get(dataserverUrl + state.first.href, function (res) {
					setState(res.body);
				});
			};

			this.last = function () {
				ajaxAgent.get(dataserverUrl + state.last.href, function (res) {
					setState(res.body);
				});
			};

			this.previous = function () {
				ajaxAgent.get(dataserverUrl + state.previous.href, function (res) {
					setState(res.body);
				});
			};
			this.next = function () {
				ajaxAgent.get(dataserverUrl + state.next.href, function (res) {
					setState(res.body);
				});
			};

			this.init = function () {
				specialistsRepository.init();
				ajaxAgent.get(dataserverUrl + "/constateringen?offset=0&limit=" + self.limit, function (res) {
					setState(res.body);
				});
			};

			// filtering
			this.filter = function (filters) {
				if (!filters) {
					throw new Error("Missing argument filters.");
				}

				var url = dataserverUrl + "/constateringen?offset=0&limit=" + self.limit;
				var queryString = ""; // a falsy value => can check against !value

				// gather all filters with and AND operator
				Object.keys(filters).forEach(function (filterKey) {

					if (filterKey === "fromDate" && filters[filterKey] !== null) {
						console.log("filters[filterKey]", filters[filterKey]);

						queryString += (queryString ? "," : "")
							+ encodeURIComponent(getPropertyFor("Datum Activiteit"))
							+ ":" + encodeURIComponent(encodeURIComponent(filters[filterKey].toISOString()));
					}

					if (filterKey === "specialist" && filters[filterKey] !== null) {
						queryString += (queryString ? "," : "")
							+ encodeURIComponent(getPropertyFor("Specialist"))
							+ ":" + encodeURIComponent(encodeURIComponent(filters[filterKey]));
					}
				});

				console.log("queryString", queryString);
				if (queryString) {
					queryString = "&filters=" + queryString;
					url += queryString;
				}

				ajaxAgent.get(url, function (res) {
					console.log("\n\nURL: ", url);

					console.log("res.body", res.body);
					setState(res.body);
				});
			};

//			this.filterOnDate = function (date) {
//				var filters = null;
//				self.columnDefinitionList.forEach(function (column) {
//
//					if (date && column.name === "Datum Activiteit") {
//						// encode the value two times, because the 
//						filters = "&filters=" + encodeURIComponent(column.property) + ":" + encodeURIComponent(encodeURIComponent(date.toISOString()));
//					}
//				});
//
//				var url = dataserverUrl + "/constateringen?offset=0&limit=" + self.limit;
//				if (filters) {
//					url += filters;
//				}
//
//				ajaxAgent.get(url, function (res) {
//					console.log("\n\nURL: ", url);
//					setState(res.body);
//				});
//			};
//
//			this.filterOnSpecialist = function (specialistName) {
//
//				var filters = null;
//				self.columnDefinitionList.forEach(function (column) {
//					if (column.name === "Specialist") {
//						filters = "&filters=" + column.property + ":" + specialistName;
//					}
//				});
//
//				var url = dataserverUrl + "/constateringen?offset=0&limit=" + self.limit;
//				if (filters) {
//					url += filters;
//				}
//
//				ajaxAgent.get(url, function (res) {
//					console.log("\n\nURL: ", url);
//					setState(res.body);
//				});
//			};

			// save
			this.updateAllProperties = function (constatering) {
				ajaxAgent.put(dataserverUrl + "/constateringen/" + constatering.Id, constatering, function (res) {
					console.log("res", res);
				});
			};

			this.updateStatus = function (constatering) {
				updateProperties(constatering.Id, {StatusId: constatering.StatusId, DBCTypering: "00.41.999"}); // test
			};

		}

		ConstateringenRepository.prototype = crafity.core.EventEmitter.prototype;
		ConstateringenRepository.prototype.limit = 12;

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
					control: "Selectbox",
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

		// expose to outside callers
		repositories.ConstateringenRepository = ConstateringenRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));