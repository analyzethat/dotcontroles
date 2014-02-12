/*globals window, Element, TextField, Grid, ButtonBar, Button*/

(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		/**
		 * 
		 * @param controle
		 * @param constateringenRepository
		 * @param specialistsRepository
		 * @constructor
		 * 
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ConstateringenView(controle, constateringenRepository, specialistsRepository) {
			var self = this;
			var _controle = controle;
			this.addClass("constateringen");

			// build the GUI elements

			// info row
			var infoRow = new html.Element("div").addClass("info-row");
			var infoContainer = new html.Element("div").addClass("info")
				.append(new html.Element("h2").text("Controle code: " + controle.Code))
				.append(new html.Element("h3").text(controle.Name))
				.append(new html.Element("h3").text("Type: " + controle.Type))
				.appendTo(infoRow);

			var filterView = new window.controles.views.ConstateringenFilterView(constateringenRepository, specialistsRepository)
				.appendTo(infoRow);

			var gridRow = new html.Element("div").addClass("grid-row");
			var mygrid = new html.Grid(constateringenRepository.columnDefinitionList).appendTo(gridRow)
				.on("selected", function (column, row, value) {
					confirm("Bevestiging status " + value + " update?");
					row[column.property] = value;
					constateringenRepository.updateStatus(row);
				});

			var backButton = new html.Button("Controles").on("click", function () {
				controles.eventbus.emit("openControles");
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

			constateringenRepository.on("data", function (rows) {
				mygrid.addRows(rows);
			});
			constateringenRepository.on("stateChanged", function () {
				firstButton.disabled(false);
				previousButton.disabled(!constateringenRepository.hasPrevious());
				nextButton.disabled(!constateringenRepository.hasNext());
				lastButton.disabled(false);
			});
			constateringenRepository.init(controle); // load data

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
		}

		ConstateringenView.prototype = new html.Element("div");
		views.ConstateringenView = ConstateringenView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));