/*globals alert, window, console, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		/**
		 * Aunthenticated user's view.
		 *
		 * @param usersRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function UserView(usersRepository) {
			if (!usersRepository) {
				throw new Error("Missing argument 'usersRepository'");
			}

			var self = this;
			var authenticatedUser = usersRepository.authenticatedUser();

			// build the GUI elements
			var infoRow = new html.Form().addClass("clientDetails readonly");
			var txtUsername = new html.TextField().label("Gebruikersnaam").appendTo(infoRow).readonly(true);
			var txtName = new html.TextField().label("Naam").appendTo(infoRow);
			var txtFamilyName = new html.TextField().label("Achternaam").appendTo(infoRow);
			var txtEmail = null;
			var roleContainer = new html.Element("div").appendTo(infoRow);
			var specialismsContainer = new html.Element("div").appendTo(infoRow);

			// data-binding
			function clearFields() {
				txtUsername.clear();
				txtName.clear();
				txtFamilyName.clear();
				if (txtEmail) {
					txtEmail.clear();
				}
				roleContainer.clear();
				specialismsContainer.clear();
			}

			function databind(user) {
				if (!user || user === null) {
					clearFields();
					return;
				}

				txtUsername.value(user.Username);
				txtName.value(user.FirstName);
				txtFamilyName.value(user.LastName);

				if (user.Email) {
					txtEmail = new html.TextField().label("Email").appendTo(infoRow);
					txtEmail.value(user.Email);
				}

				roleContainer.clear();
				specialismsContainer.clear();

				var roleCounter = 0;
				user.Roles.forEach(function (role) {
					roleCounter++;
					new html.TextField().label("Rol " + roleCounter).appendTo(roleContainer).readonly(true).value(role.Name);
				});

				var specialismCounter = 0;
				user.Specialisms.forEach(function (specialism) {
					specialismCounter++;
					new html.TextField().label("Specialisme " + specialismCounter).appendTo(specialismsContainer).readonly(true).value(specialism.Name);
				});

			}

			databind(authenticatedUser);

			function save() {
				usersRepository.user.saveContactData(txtName.value(), txtFamilyName.value(), txtEmail.value());
			}

			var buttonBar = new html.ButtonBar()
				.append(
					new html.Button("Opslaan")
						.addClass("right").hide()
						.on("click", save)
				);

			self.append(infoRow);
			self.append(buttonBar);
			self.addClass("detailsContainer");
			
			
//			Email: 'galina@crafity.com',
//						Roles: [
//							{
//								Id: 1,
//								UserId: 1,
//								FunctionalRoleId: 1,
//								Name: "Specialist",
//								NeedsSpecialism: true,
//								CreationDate: "2014-01-14 00:00:00",
//								LastMutationDate: null
//							},
//							{
//								Id: 2,
//								UserId: 1,
//								FunctionalRoleId: 3,
//								Name: "Zorgadministratie",
//								NeedsSpecialism: false,
//								CreationDate: "2014-01-14 00:00:00",
//								LastMutationDate: null
//							}
//						],
//						Specialisms: [
//							{
//								Id: 2,
//								UserId: 1,
//								SpecialismId: 9,
//								Name: "Dermatologie",
//								AGBCode: "0310",
//								CreationDate: "2014-01-14 00:00:00",
//								LastMutationDate: null
//							}]
//			
		}

		UserView.prototype = new html.Element("div");
		views.UserView = UserView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));