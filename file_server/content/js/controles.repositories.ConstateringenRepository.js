/*globals superagent, window, console*/

(function (controles) {
	"use strict";
	(function (repositories) {

		function ConstateringenRepository(ajaxAgent, dataserverUrl) {
			if (!dataserverUrl) {
				throw new Error("Expected a 'dataserverUrl' argument");
			}
			if (!ajaxAgent) {
				throw new Error("Expected a 'ajaxAgent' argument");
			}

			var self = this;
			var state;

			function setState(data) {
				state = data;
				self.emit('data', state.items);
				self.emit('stateChanged', state);
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
				ajaxAgent.get(dataserverUrl + "/constateringen?offset=0&limit=" + self.limit, function (res) {
					setState(res.body);
				});
			};

			// filtering
			this.filterOnSpecialist = function (specialistName) {
				ajaxAgent.get(dataserverUrl + "/constateringen?offset=0&limit=" + self.limit + "&filters=VerantwoordelijkSpecialist:" + specialistName, function (res) {
					setState(res.body);
				});
			};
			
			// save
			this.update = function(constatering) {
				ajaxAgent.put(dataserverUrl + "/constateringen/" + constatering.Id, constatering, function(res){
					console.log("res", res);
				});
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