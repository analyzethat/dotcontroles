/*globals window, Element, TextField, crafity */

(function (controles) {
	"use strict";
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

		var specialistsOptionList = new html.SelectField().label("specialist").readonly(false).addClass("filter");
		var dateFilter = new html.DateField().label("tonen vanaf datum").readonly(false).addClass("filter")
			.change(function (value) {

				_state.fromDate = value;
				constateringenRepository.filter(_state);
			});
		
		this.append(new html.Element("h3").text("Resultaten in tabel filteren op"))
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

	ConstateringenFilterView.prototype = new html.Element("div").addClass("filter-container form");
	controles.ConstateringenFilterView = ConstateringenFilterView;

}(window.controles = window.controles || {}));