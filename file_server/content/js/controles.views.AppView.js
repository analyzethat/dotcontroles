/*globals superagent, window, document, moment, numeral, crafity, keyboard, Element, Repository, ConstateringenView, MenuPanel, MenuItem, controles */

(function (controles) {
	"use strict";

	(function (views) {

		/**
		 * AppView - the main applciation view.
		 *
		 * @param authenticationRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function AppView(authenticationRepository) {
			if (!authenticationRepository) { throw new Error("Missing argument 'authenticationRepository'"); }

			/* Build the GUI elements */
			var menu = new crafity.html.Menu().addClass("main").appendTo(this);
			var viewContainer = new crafity.html.ViewContainer().addClass("app").appendTo(this);

			var usersRepository = new controles.repositories.UsersRepository(authenticationRepository.authenticatedUser());
			var userView = null;

			var specialismsRepository = new controles.repositories.SpecialismsRepository().init();
			var statusesRepository = new controles.repositories.StatusesRepository().init();
            var controleListRepository = new controles.repositories.ControleListRepository().init();
			var specialistsRepository = new controles.repositories.SpecialistsRepository();
			var controlesRepository = new controles.repositories.ControlesRepository(authenticationRepository.authenticatedUser());
            var controleRepository = new controles.repositories.ControleRepository(authenticationRepository.authenticatedUser());
            var controlesView = new controles.views.ControlesView(controlesRepository);
            var controleView = new controles.views.ControleView(controleRepository, controleListRepository); //controleRepository

			var constateringenRepository = null;
			var constateringenView = null;

			var medicalSuitcaseIcon = new crafity.html.Element("div").addClass("symbol medical-suitcase").text("\uF0FA");
			var personIcon = new crafity.html.Element("div").addClass("symbol person").text("\uF007");
            var editIcon = new crafity.html.Element("div").addClass("symbol edit").text("\uF044");
            var outIcon = new crafity.html.Element("div").addClass("symbol out").text("\uF045");

			menu.addMenuPanel(new crafity.html.MenuPanel("Overzicht").addMenuItems([
				new crafity.html.MenuItem("DOT Controles", function () { // F0FA
					viewContainer.activate(controlesView);
				}).select().append(medicalSuitcaseIcon)
			]));
			menu.addMenuPanel(new crafity.html.MenuPanel("Onderhoud").addMenuItems([

				new crafity.html.MenuItem("Mijn gegevens", function () {
					if (userView === null) { userView = new controles.views.UserView(usersRepository); }
					viewContainer.activate(userView);
				}).append(personIcon),
                new crafity.html.MenuItem("Controles", function () {
                    if (controleView === null) { controleView = new controles.views.UserView(controleRepository); }
                    viewContainer.activate(controleView);
                }).append(editIcon),
				new crafity.html.MenuItem("Uitloggen", function () {
					authenticationRepository.logout();
				}).append(outIcon)
			]));

			/* event handlers */
			controles.app.eventbus.on("openConstateringen", function (controle) {
				constateringenRepository = new controles.repositories.ConstateringenRepository(
					authenticationRepository.authenticatedUser(),
					specialistsRepository,
					specialismsRepository.getSimpleSpecialismList(),
					statusesRepository.getSpecialStatusList());
				
				constateringenView = new controles.views.ConstateringenView(controle, constateringenRepository, specialistsRepository);
				viewContainer.activate(constateringenView);
			});
			
			controles.app.eventbus.on("openControles", function () {
				viewContainer.activate(controlesView.refresh());
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

