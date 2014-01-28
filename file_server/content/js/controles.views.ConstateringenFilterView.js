/*globals window, Element, TextField, crafity */

(function (controles) {
	"use strict";
	
	(function (views) {
	var html = crafity.html;

	function ConstateringenFilterView(constateringenRepository, specialistsRepository) {
		if (!constateringenRepository) {
			throw new Error("Missing argument constateringenRepository");
		}
		if (!specialistsRepository) {
			throw new Error("Missing argument specialistsRepository");
		}

		var _state = {
			fromDate: null,
			specialist: null
		};
		this.state = _state;
		this.addClass("filter-container form");
		
		var specialistsOptionList = new html.SelectField().label("\uF0B0 specialist").addClass("symbol").readonly(false).addClass("filter");
		var dateFilter = new html.DateField().label("\uF0B0 tonen vanaf datum").addClass("symbol").readonly(false).addClass("filter")
			.change(function (value) {

				_state.fromDate = value;
				constateringenRepository.filter(_state);
			});

		
		var header = new html.Element("h3").text("Constateringen in tabel filteren op");
//		new html.Element("span").text("\uF0B0").addClass("symbol").appendTo(header);
//		new html.Element("span").text(" Constateringen in tabel filteren op").appendTo(header);
		
		this.append(header)
			.append(dateFilter)
			.append(specialistsOptionList);

		specialistsRepository.on("stateChanged", function (specialists) {
			// What happens here in the future?
			specialistsOptionList.options(specialists).value("all")
				.on("selected", function (value) {
					
					_state.specialist = (value === "all") ? null : value;
					constateringenRepository.filter(_state);
				});
		});
	}

	ConstateringenFilterView.prototype = new html.Element("div");
		views.ConstateringenFilterView = ConstateringenFilterView;

		
	}(controles.views = controles.views || {}));
		
}(window.controles = window.controles || {}));