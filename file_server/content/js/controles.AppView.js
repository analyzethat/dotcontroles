/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */

(function (controles) {
	"use strict";

	function AppView() {
		var self = this;

		var URL_DATASERVER = "http://data.dotcontroles.dev";

		var specialistsRepository = new controles.repositories.SpecialistsRepository(superagent, URL_DATASERVER);
		
		var constateringenRepository = new controles.repositories.ConstateringenRepository(specialistsRepository);
		var constateringenView = new crafity.controles.ConstateringenView(constateringenRepository, specialistsRepository);
		var menu = new crafity.html.Menu().addClass("main").appendTo(this);
		var viewContainer = new crafity.html.ViewContainer().addClass("app").appendTo(this);
		var userView = new crafity.controles.UserView(new crafity.controles.Repository());

//		appContainer = new crafity.html.Element("div").addClass("app");

		menu.addMenuPanel(new crafity.html.MenuPanel("Overzicht")
			.addMenuItems([
				new crafity.html.MenuItem("Constateringen", function () {
					viewContainer.activate(constateringenView);
				}).select()
			]));

		menu.addMenuPanel(new crafity.html.MenuPanel("Systeem").addMenuItems([
			
			new crafity.html.MenuItem("Mijn gegevens", function () {
				viewContainer.activate(userView);
			}),
			new crafity.html.MenuItem("Uitloggen", function () {
				self.emit("logout");
			})
		]));

//		appContainer.toggleClass("fullscreen");

		crafity.keyboard.on("cmd+shft+m", function (e) {
			viewContainer.toggleClass("fullscreen");
			e.preventDefault();
		});

	}

	AppView.prototype = new crafity.html.Element("div");
	controles.AppView = AppView;

}(window.controles = window.controles || {}));

