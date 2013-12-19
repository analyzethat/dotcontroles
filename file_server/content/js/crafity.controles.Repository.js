/*globals superagent, window*/

(function (crafity) {
	"use strict";

	(function (controles) {

		/**
		 * The constateringen columns are placed in an Array of zero or more column definition objects
		 *
		 *  Description | Status | Price | Creation Date | Specialist | Id
		 *
		 * @type {Array}
		 */
		var constateringenColumnDefinitionList = [

			{ name: "Description",
				property: "description",
				type: "String"
			},

			{ name: "Status",
				property: "status",
				type: "Number",
				options: [
					{ value: 0, text: " "},
					{ value: 1, text: "Open"},
					{ value: 2, text: "In progress"},
					{ value: 3, text: "Complete"}
				],
				editable: {
					control: "Selectbox",
					"default": 2
				}
			},

			{ name: "Price",
				property: "price",
				type: "Number",
				format: "$0,0.00"
			},

			{ name: "Creation Date",
				property: "creationDate",
				type: "Date",
				sortable: "descending",
				format: "DD-MM-YYYY"
			},

			{ name: "Specialist",
				property: "creator",
				type: "String"
			},

			{ name: "Id",
				property: "id",
				type: "Number"
			}

		];

		function Repository() {

			var ajaxAgent = superagent;

			this.constateringen = {

				getColumnDefinitionList: function () {
					return constateringenColumnDefinitionList;
				},

				getDataRows: function (callback) {
					// ajax call
					ajaxAgent.get("http://data.dotcontroles.dev/constateringen", function (res) {
						return callback(null, res.body);
					});
				},
				
				// correct status because of human error
				// update status because of progress
				
				updateStatus: function (id, statusId, callback) {
					// ajax call
					
					// /constatering/correctie
					ajaxAgent.post("/constateringen/" + id, {id: 5, statusId: statusId, reason: "ssS"}, function (res) {
						return callback(null, res.body);
					});
				}
			};

		}

		controles.Repository = Repository;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));


