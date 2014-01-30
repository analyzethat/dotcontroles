/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */

(function (controles) {
	"use strict";

	(function (views) {

		function AppView(authenticationRepository){
			if (!authenticationRepository) {
				throw new Error("Missing argument 'authenticationRepository'");
			}	

			var menu = new crafity.html.Menu().addClass("main").appendTo(this);
			var viewContainer = new crafity.html.ViewContainer().addClass("app").appendTo(this);
			
			var usersRepository = new controles.repositories.UsersRepository(authenticationRepository.authenticatedUser());
			var userView = new controles.views.UserView(usersRepository);

			var specialistsRepository = new controles.repositories.SpecialistsRepository();
			var constateringenRepository = null;
			var constateringenView = null;
			var controlesRepository = new controles.repositories.ControlesRepository(authenticationRepository.authenticatedUser());
			var controlesView = new controles.views.ControlesView(controlesRepository);

			menu.addMenuPanel(new crafity.html.MenuPanel("Overzicht").addMenuItems([
					new crafity.html.MenuItem("DOT Controles", function () {
						viewContainer.activate(controlesView);
					}).select()
				]));
			menu.addMenuPanel(new crafity.html.MenuPanel("Systeem").addMenuItems([

				new crafity.html.MenuItem("Mijn gegevens", function () {
					viewContainer.activate(userView);
				}),
				new crafity.html.MenuItem("Uitloggen", function () {
					authenticationRepository.logout();
				})
			]));

			controles.eventbus.on("openConstateringen", function (controle) {
				console.log("Open constateringen", controle);
				constateringenRepository = new controles.repositories.ConstateringenRepository(specialistsRepository);
				constateringenView = new controles.views.ConstateringenView(controle, constateringenRepository, specialistsRepository);
				viewContainer.activate(constateringenView);
			});

			controles.eventbus.on("openControles", function () {
				console.log("Open controles");
				viewContainer.activate(controlesView.load());
			});

//		appContainer.toggleClass("fullscreen");
			crafity.keyboard.on("cmd+shft+m", function (e) {
				viewContainer.toggleClass("fullscreen");
				e.preventDefault();
			});

		}

		AppView.prototype = new crafity.html.Element("div");
		views.AppView = AppView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));

