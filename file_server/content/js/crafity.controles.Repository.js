/*globals superagent, window, console*/

(function (crafity) {
	"use strict";

	(function (controles) {

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
		var constateringenColumnDefinitionList = [

			{ name: "Status",
				property: "StatusId",
				type: "Number",
				options: [
					{ value: 0, text: " "},
					{ value: 1, text: "Open"},
					{ value: 2, text: "Status 2"},
					{ value: 3, text: "Status 3"},
					{ value: 4, text: "Status 4"},
					{ value: 5, text: "Status 5"},
					{ value: 6, text: "Doorgezet"}
				],
				editable: {
					control: "Selectbox",
					"default": 2
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

//			{ name: "Id",
//				property: "id",
//				type: "Number"
//			}

//			{ name: "Price",
//				property: "price",
//				type: "Number",
//				format: "$0,0.00"
//			},
		];

		function Repository() {
			var URL_DATASERVER = "http://data.dotcontroles.dev";
			var ajaxAgent = superagent;
			var user = null;

			this.users = {
				get: function (callback) {
					ajaxAgent
						.get(URL_DATASERVER + "users")
						.end(function (res) {
							if (res.error) {
								callback(res.error, null);
							} else {
								callback(null, res.body);
							}
						});
				}
			};

			this.user = {
				get: function (callback) {
					ajaxAgent
						.get(URL_DATASERVER + "user/1")
						.end(function (res) {
							if (res.error) {
								callback(res.error, null);
							} else {
								callback(null, res.body);
							}
						});

				},
				save: function (firstName, lastName) {
					ajaxAgent.post(URL_DATASERVER + "user/" + user.id)
						.send({firstName: firstName, lastName: lastName})
						.end(function (res) {
							console.log("Result from saving user data to database: res", res);
						});
				}
			};

//			this.getConstateringen = function (callback) {
//				var state;
//
//				var constateringen = {
//					
//					getColumnDefinitionList: function () {
//						return constateringenColumnDefinitionList;
//					},
//					
//					getRows: function () {
//						return state.items;
//					},
//
//					getFirst: function (callback) {
//						ajaxAgent.get(URL_DATASERVER + state.first.href, function (res) {
//							state = res.body;
//							return callback(constateringen);
//						});
//					},
//
//					getLast: function (callback) {
//						ajaxAgent.get(URL_DATASERVER + state.last.href, function (res) {
//							state = res.body;
//							return callback(constateringen);
//						});
//					}
//
//				};
//
//				// initial call to backend
//				ajaxAgent.get(URL_DATASERVER + "/constateringen?offset=0", function (res) {
//					state = res.body;
//					return callback(constateringen);
//				});
//			};

		}

		controles.Repository = Repository;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));


