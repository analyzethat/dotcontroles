/*globals alert, window, console, confirm, Element, TextField, Grid, ButtonBar, Button, crafity*/

(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		/**
		 * Constateringen view.
		 *
		 * @param controle
		 * @param constateringenRepository
		 * @param specialistsRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ConstateringenView(controle, constateringenRepository, specialistsRepository) {
			if (!controle) { throw new Error("Missing argument 'controle'"); }
			if (!constateringenRepository) { throw new Error("Missing argument 'constateringenRepository'"); }
			if (!specialistsRepository) { throw new Error("Missing argument 'specialistsRepository'"); }

			this.addClass("constateringen");

			/* Build the GUI elements */
			var infoRow = new html.Element("div").addClass("info-row");

			var userRolesString = "";
			constateringenRepository.getUserRoles().forEach(function (role) {
				userRolesString += (userRolesString ? ", " : "") + role.Name;
			});

			var infoContainer = new html.Element("div").addClass("info")
				.append(new html.Element("h2").text("Constateringen voor " + controle.Code))
				.append(new html.Element("h3").text('"' + controle.Name + '"'))
				.append(new html.Element("h4").text("Type: " + controle.Type))
				.append(new html.Element("h4").text("Rollen: " + userRolesString))
				.appendTo(infoRow);
			// listen to the state changed event of this repo in order to update the list of specialists

			var filterView = new window.controles.views.ConstateringenFilterView(constateringenRepository, specialistsRepository)
				.appendTo(infoRow);

			var gridRow = new html.Element("div").addClass("grid-row");
			var mygrid = new html.Grid(constateringenRepository.columnDefinitionList).appendTo(gridRow)
				.onsort(function (e) {
					if (config.logger.level > 2) { console.log("\nSorting ", e.column.property, e.order); }
					if (e) {
						constateringenRepository.filter({"sortBy": e.column.property, "sortOrder": e.order });
					}
				})
				.on("selectedStatus", function (column, row, value) {
					if (confirm("Status verandering bevestigen?")) { // bevastigingsscherm bij wijziging status
						row[column.property] = value;
						constateringenRepository.changeStatus(value, row);
					}
				})
				.on("selectedSpecialism", function (column, row, value) {
					if (confirm('Doorzetten naar een ander specialisme?')) {
						row[column.property] = value;
						constateringenRepository.assignToSpecialism(value, row);
					}
				});

			var backIcon = new crafity.html.Element("div").addClass("symbol back").text("\uF122"); //F060
			var backButton = new html.Button("Controles").append(backIcon).on("click", function () {
				controles.app.eventbus.emit("openControles");
			});
			var firstButton = new html.Button("Eerste").addClass("right").disabled(true).on("click", function () {
				constateringenRepository.first();
			});
			var lastButton = new html.Button("Laatste").addClass("right").disabled(true).on("click", function () {
				constateringenRepository.last();
			});
			var previousButton = new html.Button("<<").addClass("right").disabled(true).on("click", function () {
				constateringenRepository.previous();
			});
			var nextButton = new html.Button(">>").addClass("right").disabled(true).on("click", function () {
				constateringenRepository.next();
			});

			// command row
			var commandRow = new html.Element("div").addClass("command-row")
				.append(new html.ButtonBar()
					.append(backButton)
					.append(lastButton)
					.append(nextButton)
					.append(previousButton)
					.append(firstButton));

			this.append(infoRow)
				.append(gridRow)
				.append(commandRow);
			
			/* event handlers */
			constateringenRepository.on("data", function (rows) {
				mygrid.addRows(rows);
			});
			constateringenRepository.on("stateChanged", function () {
				firstButton.disabled(!constateringenRepository.hasPrevious());
				previousButton.disabled(!constateringenRepository.hasPrevious());
				nextButton.disabled(!constateringenRepository.hasNext());
				lastButton.disabled(!constateringenRepository.hasNext());
			});

			constateringenRepository.init(controle); // load data

		}

		ConstateringenView.prototype = new html.Element("div");
		views.ConstateringenView = ConstateringenView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));