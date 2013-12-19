/*globals window, Element, TextField, Grid*/

(function (crafity) {
	"use strict";
	(function (controles) {

		function ConstateringenView(repository) {
			var self = this;
			var constateringenRepo = repository.constateringen;

			var info = new Element("div").addClass("info");
			new Element("h3").text("VDC00037").appendTo(info);
			new Element("p").text("Aanvrager (poort)specialisme in dummy DBC").appendTo(info);

			var infoRow = new Element("div").addClass("info-row");
			infoRow.append(info);

			var filterContainer = new Element("div").addClass("filter-container form");
			new Element("h3").text("Resultaten in tabel filteren").appendTo(filterContainer);

			new TextField().label("tonen vanaf").readonly(false).addClass("filter").appendTo(filterContainer);
			new TextField().label("vakgroep").readonly(false).addClass("filter").appendTo(filterContainer);
			new TextField().label("specialist").readonly(false).addClass("filter").appendTo(filterContainer);
			new TextField().label("locatie").readonly(false).addClass("filter").appendTo(filterContainer);
			infoRow.append(filterContainer);

			var mygrid = new Grid(constateringenRepo.getColumnDefinitionList());
			constateringenRepo.getDataRows(function (err, result) {
				mygrid.addRows(result);
			});

			this.append(infoRow);
			this.append(mygrid);
		}

		ConstateringenView.prototype = new Element("div").addClass("constateringen");
		controles.ConstateringenView = ConstateringenView;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));