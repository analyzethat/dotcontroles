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
			this.addClass("controles"); // gasltodo create own css class

			var gridRow = new html.Element("div").addClass("grid-row");
			var mygrid = new html.Grid(controlesRepository.columnDefinitionList).appendTo(gridRow);

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

			controlesRepository.on("data", function (rows) {
				console.log("ControlesView on data, rows", rows);
				mygrid.addRows(rows);
			});
			controlesRepository.on("stateChanged", function () {
				firstButton.disabled(false);
				previousButton.disabled(!controlesRepository.hasPrevious());
				nextButton.disabled(!controlesRepository.hasNext());
				lastButton.disabled(false);
			});

			mygrid.on("open", function (row) {
				//console.log("Selected", row);
				controles.app.eventbus.emit("openConstateringen", row);
			});

			controlesRepository.init(); // load data

			var infoRow = new html.Element("div").addClass("info-row");
			var infoContainer = new html.Element("div").addClass("info")
				.append(new html.Element("h2").text("DOT Controles"))
				.append(new html.Element("h3").text("Rollen: rol1, rol2"))
				.appendTo(infoRow);

			var commandRow = new html.Element("div").addClass("command-row")
				.append(new html.ButtonBar()
					.append(lastButton)
					.append(nextButton)
					.append(previousButton)
					.append(firstButton));

			this.append(infoRow)
				.append(gridRow)
				.append(commandRow);
		}

		ControlesView.prototype = new html.Element("div");
		views.ControlesView = ControlesView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));