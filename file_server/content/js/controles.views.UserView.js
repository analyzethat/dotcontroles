/*globals window, console, Element, TextField, Grid, ButtonBar, Button, Form*/

(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		function UserView(repository) {
			if (!repository) {
				throw new Error("Missing argument repository");
			}

			var self = this;
			var user = repository.user;

			console.log("repository.user", repository.user);
			// build the GUI elements
			var infoRow = new html.Form().addClass("clientDetails readonly");
			var txtUsername = new html.TextField().label("gebruikersnaam").appendTo(infoRow).readonly(true).value(user.username);
			var txtName = new html.TextField().label("Naam").appendTo(infoRow).value(user.firstName);
			var txtFamilyName = new html.TextField().label("Achternaam").appendTo(infoRow).value(user.lastName);

//			repository.user.get(function (err, user) {
//
//				if (err) {
//					console.log("err", err);
//				} else {
////					console.log("Got user: ", user);
//					txtUsername.value(user.username);
//					txtName.value(user.firstName);
//					txtFamilyName.value(user.lastName);
//				}
//			});

			this.addClass("detailsContainer");
			this.save = function () {
				if (!user || user === null) {
					return;
				}

				repository.user.save(txtName.value(), txtFamilyName.value());
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