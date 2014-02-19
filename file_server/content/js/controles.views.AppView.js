/*globals superagent, window, document, console, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */

(function (controles) {
	"use strict";

	(function (views) {

		/**
		 *
		 * @param authenticationRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function AppView(authenticationRepository) {
			if (!authenticationRepository) {
				throw new Error("Missing argument 'authenticationRepository'");
			}

			var menu = new crafity.html.Menu().addClass("main").appendTo(this);
			var viewContainer = new crafity.html.ViewContainer().addClass("app").appendTo(this);

			var usersRepository = new controles.repositories.UsersRepository(authenticationRepository.authenticatedUser());
			var userView = null;

			var specialistsRepository = new controles.repositories.SpecialistsRepository();
			var controlesRepository = new controles.repositories.ControlesRepository(authenticationRepository.authenticatedUser());
			var controlesView = new controles.views.ControlesView(controlesRepository);

			var constateringenRepository = null;
			var constateringenView = null;

			
			var medicalSuitcaseIcon = new crafity.html.Element("div").addClass("symbol medical-suitcase").text("\uF0FA");
			var personIcon = new crafity.html.Element("div").addClass("symbol person").text("\uF007");
			var outIcon = new crafity.html.Element("div").addClass("symbol out").text("\uF045");
			
			menu.addMenuPanel(new crafity.html.MenuPanel("Overzicht").addMenuItems([
				
				new crafity.html.MenuItem("DOT Controles", function () { // F0FA
					viewContainer.activate(controlesView);
				}).select().append(medicalSuitcaseIcon)
			])
			
			
			);
			menu.addMenuPanel(new crafity.html.MenuPanel("Systeem").addMenuItems([

				new crafity.html.MenuItem("Mijn gegevens", function () {
					if (userView === null) {
						userView = new controles.views.UserView(usersRepository);
					}
					viewContainer.activate(userView);
				}).append(personIcon),
				
				new crafity.html.MenuItem("Uitloggen", function () {
					authenticationRepository.logout();
				}).append(outIcon)
			]));

			controles.app.eventbus.on("openConstateringen", function (controle) {
				console.log("Open constateringen", controle);
				constateringenRepository = new controles.repositories.ConstateringenRepository(authenticationRepository.authenticatedUser(), specialistsRepository);
				constateringenView = new controles.views.ConstateringenView(controle, constateringenRepository, specialistsRepository);
				viewContainer.activate(constateringenView);
			});
			controles.app.eventbus.on("openControles", function () {
				console.log("Open controles");
//				console.log("controlesView", controlesView);
				viewContainer.activate(controlesView);
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

