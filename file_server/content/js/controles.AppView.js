/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */

(function (controles) {
	"use strict";

	function AppView() {
		var self = this;

		var URL_DATASERVER = "http://data.dotcontroles.dev";

		var specialistsRepository = new controles.repositories.SpecialistsRepository(superagent, URL_DATASERVER);

		var constateringenRepository = null;
		var constateringenView = null;
		var controlesRepository = new controles.repositories.ControlesRepository();
		var controlesView = new controles.views.ControlesView(controlesRepository);
		var menu = new crafity.html.Menu().addClass("main").appendTo(this);
		var viewContainer = new crafity.html.ViewContainer().addClass("app").appendTo(this);
		var userView = new crafity.controles.UserView(new crafity.controles.Repository());

		menu.addMenuPanel(new crafity.html.MenuPanel("Overzicht")
			.addMenuItems([
				new crafity.html.MenuItem("DOT Controles", function () {
					viewContainer.activate(controlesView);
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

		controles.eventbus.on("openConstateringen", function (controleId) {
			console.log("Open constateringen", controleId);
			constateringenRepository = new controles.repositories.ConstateringenRepository(specialistsRepository);
			constateringenView = new controles.views.ConstateringenView(constateringenRepository, specialistsRepository);
			viewContainer.activate(constateringenView);
		});
		
		controles.eventbus.on("openControles", function () {
			console.log("Open controles");
			viewContainer.activate(controlesView);
		});
		
		
//		appContainer.toggleClass("fullscreen");

		crafity.keyboard.on("cmd+shft+m", function (e) {
			viewContainer.toggleClass("fullscreen");
			e.preventDefault();
		});

	}

	AppView.prototype = new crafity.html.Element("div");
	controles.AppView = AppView;

}(window.controles = window.controles || {}));

