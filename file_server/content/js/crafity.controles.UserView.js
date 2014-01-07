/*globals window, console, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (crafity) {
	"use strict";
	var html = crafity.html;
	
	(function (controles) {

		function UserView(repository) {
			var self = this;
			var user = null;

			// build the GUI elements
			var infoRow = new html.Form().addClass("clientDetails readonly");
			var txtUsername = new html.TextField().label("gebruikersnaam").appendTo(infoRow).readonly(true);
			var txtName = new html.TextField().label("Naam").appendTo(infoRow);
			var txtFamilyName = new html.TextField().label("Achternaam").appendTo(infoRow);

			repository.user.get(function (err, user) {
			
				if (err) {
					console.log("err", err);
				} else {

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

			var buttonBar = new html.ButtonBar()
				.append(
					new html.Button("Opslaan")
						.addClass("right")
						.on("click", self.save)
				);

			this.append(infoRow);
			this.append(buttonBar);
		}

		UserView.prototype = new html.Element("div").addClass("detailsContainer");
		controles.UserView = UserView;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));