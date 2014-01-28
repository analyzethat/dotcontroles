/*globals window, console, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		function UserView(usersRepository) {
			if (!usersRepository) {
				throw new Error("Missing argument 'usersRepository'");
			}

			var self = this;
			var authenticatedUser = null; //usersRepository.authenticatedUser();

			console.log("\n inside UserView ", authenticatedUser);
			// build the GUI elements
			var infoRow = new html.Form().addClass("clientDetails readonly");
			var txtUsername = new html.TextField().label("Gebruikersnaam").appendTo(infoRow).readonly(true);
			var txtName = new html.TextField().label("Naam").appendTo(infoRow);
			var txtFamilyName = new html.TextField().label("Achternaam").appendTo(infoRow);
			var txtEmail = new html.TextField().label("Email").appendTo(infoRow);
			var roleContainer = new html.Element("div").appendTo(infoRow);
			var specialismsContainer = new html.Element("div").appendTo(infoRow);

			// data-binding
			controles.eventbus.on("authenticated", function (user) {
				authenticatedUser = user;

				txtUsername.value(authenticatedUser.Username);
				txtName.value(authenticatedUser.FirstName);
				txtFamilyName.value(authenticatedUser.LastName);
				txtEmail.value(authenticatedUser.Email);

				roleContainer.clear();
				specialismsContainer.clear();
				
				var roleCounter = 0;
				authenticatedUser.Roles.forEach(function (role) {
					roleCounter++;
					new html.TextField().label("Rol " + roleCounter).appendTo(roleContainer).readonly(true).value(role.Name);
				});

				var specialismCounter = 0;
				authenticatedUser.Specialisms.forEach(function (specialism) {
					specialismCounter++;
					new html.TextField().label("Specialisme " + specialismCounter).appendTo(specialismsContainer).readonly(true).value(specialism.Name);
				});
			});

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
			this.addClass("detailsContainer");
			this.save = function () {
				if (!authenticatedUser || authenticatedUser === null) {
					return;
				}

				usersRepository.user.save(txtName.value(), txtFamilyName.value());
			};

			var buttonBar = new html.ButtonBar()
				.append(
					new html.Button("Opslaan")
						.addClass("right").hide()
						.on("click", self.save)
				);

			this.append(infoRow);
			this.append(buttonBar);
		}

		UserView.prototype = new html.Element("div");
		views.UserView = UserView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));