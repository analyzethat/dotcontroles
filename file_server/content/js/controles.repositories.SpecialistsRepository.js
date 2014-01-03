/*globals window, console*/
(function (controles) {
	"use strict";
	(function (repositories) {

		function SpecialistsRepository(ajaxAgent, dataserverUrl) {
			if (!dataserverUrl) {
				throw new Error("Expected a 'dataserverUrl' argument");
			}
			if (!ajaxAgent) {
				throw new Error("Expected a 'ajaxAgent' argument");
			}

			var self = this;

			this.getSpecialists = function () {
				var specialists = {"all": "<alles>", null: "<leeg>", "Jansen": "Jansen", "Pulles": "Pulles"};
				console.log("specialists", specialists);
				return specialists;
			};

		}

		SpecialistsRepository.prototype = crafity.core.EventEmitter.prototype;

		// expose to outside callers
		repositories.SpecialistsRepository = SpecialistsRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));