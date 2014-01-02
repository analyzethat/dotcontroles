/*globals window, console, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (crafity) {
	"use strict";
	(function (controles) {

		function UserView(repository) {
			var self = this;
			var user = null;

			// build the GUI elements
			var infoRow = new Form().addClass("clientDetails readonly");
			var txtUsername = new TextField().label("gebruikersnaam").appendTo(infoRow).readonly(true);
			var txtName = new TextField().label("Naam").appendTo(infoRow);
			var txtFamilyName = new TextField().label("Familienaam").appendTo(infoRow);

			repository.user.get(function (err, result) {
			
				if (err) {
					console.log("err", err);
				} else {

					user = result[0];
					console.log("Got user: ", user);

					txtUsername.value(user.username);
					txtName.value(user.firstName);
					txtFamilyName.value(user.lastName);
				}
			});

			this.save = function () {
				if (!user || user === null) {
					return;
				}

				repository.user.save(txtName.value(), txtFamilyName.value());
			};

			var buttonBar = new ButtonBar()
				.append(
					new Button("Opslaan")
						.addClass("right")
						.on("click", self.save)
				);

			this.append(infoRow);
			this.append(buttonBar);
		}

		UserView.prototype = new Element("div").addClass("detailsContainer");
		controles.UserView = UserView;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));