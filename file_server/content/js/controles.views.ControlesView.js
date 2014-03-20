/*globals window, Element, TextField, Grid, ButtonBar, Button, crafity, console*/
(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		/**
		 * User's view on DOT controles.
		 *
		 * @param controlesRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ControlesView(controlesRepository) {
			if (!controlesRepository) { throw new Error("Missing argument 'controlesRepository'"); }

			/* Build the GUI elements */
			this.addClass("controles"); // gasltodo create own css class

			var gridRow = new html.Element("div").addClass("grid-row");
			var grid = new html.Grid(controlesRepository.columnDefinitionList).appendTo(gridRow)
				.onsort(function (e) {
					if (config.logger.level > 2) { console.log("\nSorting ", e.column.property, e.order); }
					if (e) {
						controlesRepository.filter({"sortBy": e.column.property, "sortOrder": e.order });
					}
				});

			var firstButton = new html.Button("Eerste").addClass("right").disabled(true).on("click", function () {
				controlesRepository.first();
			});
			var lastButton = new html.Button("Laatste").addClass("right").disabled(true).on("click", function () {
				controlesRepository.last();
			});
			var previousButton = new html.Button("<<").addClass("right").disabled(true).on("click", function () {
				controlesRepository.previous();
			});
			var nextButton = new html.Button(">>").addClass("right").disabled(true).on("click", function () {
				controlesRepository.next();
			});

			var userRolesString = "";
			controlesRepository.getUserRoles().forEach(function (role) {
				userRolesString += (userRolesString ? ", " : "") + role.Name;
			});

			var infoRow = new html.Element("div").addClass("info-row")
				.append(new html.Element("div").addClass("info")
					.append(new html.Element("h2").text("DOT Controles"))
					.append(new html.Element("h3").text("Rollen: " + userRolesString))
				);

			var commandRow = new html.Element("div").addClass("command-row")
				.append(new html.ButtonBar()
					.append(lastButton)
					.append(nextButton)
					.append(previousButton)
					.append(firstButton));

			this.append(infoRow)
				.append(gridRow)
				.append(commandRow);

			/* event handlers */
			grid.on("open", function (row) {
				controles.app.eventbus.emit("openConstateringen", row);
			});
			controlesRepository.on("data", function (rows) {
				grid.addRows(rows);
			});
			controlesRepository.on("stateChanged", function () {
				firstButton.disabled(!controlesRepository.hasPrevious());
				previousButton.disabled(!controlesRepository.hasPrevious());
				nextButton.disabled(!controlesRepository.hasNext());
				lastButton.disabled(!controlesRepository.hasNext());
			});

			this.refresh = function () {
				controlesRepository.init();
				return this;
			};

			this.refresh();
		}

		ControlesView.prototype = new html.Element("div");
		views.ControlesView = ControlesView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));