/*globals window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem */
"use strict";

var appContainer;

var app = {
	initialize: function () {
		// set the local region
		numeral.language("be-nl");
		moment.lang("nl");

		console.element = document.querySelector(".console");

		var repository = new crafity.controles.Repository();
		var constateringenView = new crafity.controles.ConstateringenView(repository);

		appContainer = new Element("div").addClass("app");

		document.body.appendChild(
			new MenuPanel("Administration")
				.addMenuItems([
					new MenuItem("Constateringen", function () {
						appContainer.getChildren().forEach(function (child) {
							if (child === constateringenView) {
								child.show();
							} else {
								child.hide();
							}
						});
						appContainer.append(constateringenView);
					}).select()
				])
				.addClass("main")
				.show()
				.render()
		);

		document.body.appendChild(appContainer.render());

//		appContainer.toggleClass("fullscreen");
		
		keyboard.on("cmd+shft+m", function (e) {
			appContainer.toggleClass("fullscreen");
			e.preventDefault();
		});
	}
};

var console1 = {
	console: window.console,
	element: null,
	log: function () {
		var args = Array.prototype.slice.call(arguments);
		args.forEach(function (arg) {
			console.element.innerText += arg.toString() + " ";
		});
		console.element.innerText += "\n";
	}
};
