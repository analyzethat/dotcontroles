/*globals window, Element, TextField, Grid, ButtonBar, Button, crafity, console*/
(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		function ControlesView(controlesRepository) {
			this.addClass("constateringen"); // gasltodo create own css class

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
			
			mygrid.on("open", function (row) {
				//console.log("Selected", row);
				controles.eventbus.emit("openConstateringen", row.Id);
			});
			
			controlesRepository.on("stateChanged", function () {
				firstButton.disabled(false);
				previousButton.disabled(!controlesRepository.hasPrevious());
				nextButton.disabled(!controlesRepository.hasNext());
				lastButton.disabled(false);
			});
			controlesRepository.init(); // load data

			// build the GUI elements

			// info row
			var infoRow = new html.Element("div").addClass("info-row");
			var infoContainer = new html.Element("div").addClass("info")
				.append(new html.Element("h3").text("DOT Controles"))
				.appendTo(infoRow);

			// command row
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