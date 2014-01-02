/*globals window, Element, TextField, Grid, ButtonBar, Button*/

(function (crafity) {
	"use strict";
	(function (controles) {

		function ConstateringenView(constateringenRepository) {
			var self = this;

			this.save = function () {
				throw new Error("not implemented.");
			};
			this.cancel = function () {
				throw new Error("Not implemented!");
			};

			var mygrid = new Grid(constateringenRepository.columnDefinitionList);
			var previousButton = new Button("Previous").on("click", constateringenRepository.previous);
			var nextButton = new Button("Next").on("click", constateringenRepository.next);

			constateringenRepository.on("data", function (rows) {
				mygrid.addRows(rows);
			});
			constateringenRepository.on("stateChanged", function () {
				previousButton.disabled(!constateringenRepository.hasPrevious());
				nextButton.disabled(!constateringenRepository.hasNext());
			});

			constateringenRepository.init();

			// build the GUI elements
			var info = new Element("div").addClass("info");
			new Element("h3").text("VDC00037").appendTo(info);
			new Element("p").text("Aanvrager (poort)specialisme in dummy DBC").appendTo(info);

			// info row
			var infoRow = new Element("div").addClass("info-row");
			infoRow.append(info);

			var filterContainer = new Element("div").addClass("filter-container form");
			new Element("h3").text("Resultaten in tabel filteren op").appendTo(filterContainer);

			new TextField().label("tonen vanaf datum").readonly(false).addClass("filter").appendTo(filterContainer);
			new TextField().label("specialist").readonly(false).addClass("filter").appendTo(filterContainer);
			new TextField().label("locatie").readonly(false).addClass("filter").appendTo(filterContainer);
			infoRow.append(filterContainer);

			// command row
			var commandRow = new Element("div").addClass("command-row");

			var children = new Button("Previous")
				.on("click", constateringenRepository.previous);
			var buttonBar = new ButtonBar()
				.append(new Button("Opslaan")
					.on("click", self.save))
				.append(new Button("Annuleren")
					.on("click", self.cancel))

				.append(new Button("First")
					.on("click", constateringenRepository.first))
				.append(new Button("Last")
					.on("click", constateringenRepository.last))
				.append(previousButton)
				.append(nextButton)

				.appendTo(commandRow);

			this.append(infoRow);
			this.append(mygrid);
			this.append(commandRow);
		}

		ConstateringenView.prototype = new Element("div").addClass("constateringen");
		controles.ConstateringenView = ConstateringenView;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));