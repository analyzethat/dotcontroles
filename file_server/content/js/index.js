/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */
"use strict";

var appContainer;

var app = {
	initialize: function () {
		// set the local region
		numeral.language("be-nl");
		moment.lang("nl");

		console.element = document.querySelector(".console");

		// BEGIN only for testing purposes
		window.login = function () {
			// test login
			superagent.post("http://data.dotcontroles.dev/login")
				.type('form')
				.send({ username: 'gasl', password: "gasl" })
				.end(function (res) {
					console.log("AFTER LOGGING res", res);
				});
		};

		window.getUser = function () {
			// test login
			superagent
				.get("http://data.dotcontroles.dev/user/1")
				.end(function (res) {
					console.log(res);
				});
		};
		// END only for testing purposes
		var URL_DATASERVER = "http://data.dotcontroles.dev";
		
		var specialistsRepository = new controles.repositories.SpecialistsRepository(superagent, URL_DATASERVER);
		var constateringenRepository = new controles.repositories.ConstateringenRepository(superagent, URL_DATASERVER, specialistsRepository);
		var constateringenView = new crafity.controles.ConstateringenView(constateringenRepository, specialistsRepository);
		
		var userView = new crafity.controles.UserView(new crafity.controles.Repository());

		appContainer = new crafity.html.Element("div").addClass("app");

		document.body.appendChild(
			new crafity.html.MenuPanel("Overzicht")
				.addMenuItems([
					new crafity.html.MenuItem("Mijn gegevens", function () {
						appContainer.getChildren().forEach(function (child) {
							if (child === userView) {
								child.show();
							} else {
								child.hide();
							}
						});
						appContainer.append(userView);
					}).select(),
					new crafity.html.MenuItem("Constateringen", function () {
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

		crafity.keyboard.on("cmd+shft+m", function (e) {
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
