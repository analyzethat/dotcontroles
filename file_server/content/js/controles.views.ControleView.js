/*globals alert, window, Element, TextField, Grid, ButtonBar, Button, Form, crafity*/

(function (controles) {
	"use strict";
	var html = crafity.html;

	(function (views) {

		/**
		 * Aunthenticated user's view.
		 *
		 * @param controleRepository
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ControleView(controleRepository, controleListRepository) { //controleRepository
            if (!controleRepository) { throw new Error("Missing argument 'controleRepository'"); }
            if (!controleListRepository) { throw new Error("Missing argument 'controleListRepository'"); }
            /* Build the GUI elements */


            this.addClass("controle"); // jvdbtodo create own css class
            var self = this;

            var _controleList = controleListRepository.controleList;
            var _state = {
                controle: null
            };
            self.state = _state;



            /* Build the GUI elements */

           // var controleList = controleRepository.controleList;

            var infoRow = new html.Element("div").addClass("info-row");
            var slfControle = new html.SelectField().label("\uF0B0 controle").addClass("symbol").readonly(false).addClass("filter");

            var frmEditControle = new html.Form().addClass("editControle");
            var txtCode = new html.TextField().label("Code").appendTo(frmEditControle);
            var txtName = new html.TextField().label("Name").appendTo(frmEditControle);
            var txtType = new html.TextField().label("Type").appendTo(frmEditControle);

            // fill dropdown slfControle with a list of controles
            controleListRepository.on("stateChanged", function (controleList) {
                slfControle.options(controleList).on("selected", function (value) {
                        _state.controle = value;
                        controleRepository.getControle(_state.controle); // request the properties of the chosen controle
                    });
            });

            // set value of fields after the control is selected from the dropdown
            controleRepository.on("stateChanged", function (data) {
                txtCode.value(data.Code);
                txtName.value(data.Name);
                txtType.value(data.Type);
            });
            function save() {
                controleRepository.saveControleData(_state.controle,txtCode.value(), txtName.value(), txtType.value());
            }

            var buttonBar = new html.ButtonBar().append(
                new html.Button("Opslaan").addClass("right").on("click", save)
            );

            slfControle.appendTo(infoRow);
			self.append(infoRow);
			self.append(buttonBar);
            self.append(frmEditControle);
			self.addClass("detailsContainer");
		}

		ControleView.prototype = new html.Element("div");
		views.ControleView = ControleView;

	}(controles.views = controles.views || {}));

}(window.controles = window.controles || {}));