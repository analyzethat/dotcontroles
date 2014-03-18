/*globals window, console, superagent, crafity*/

(function (controles) {
	"use strict";
	(function (repositories) {

		/**
		 * Specialist repository
		 *
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function SpecialistsRepository() {
			var ajaxAgent = superagent;
			var self = this;
			var state = null;
			var _url = controles.URL_DATASERVER + "/specialists";
			

			/* Auxiliary methods */
			function setState(data) {
				state = data;
				console.log("\n\nNew update specialists: ", state);

				self.emit('stateChanged', state);
			}

			/* End auxiliary methods */

			/**
			 * Initialize.
			 * @param controle
			 */
			this.init = function () {
				self.getSpecialists();
			};

			/**
			 * Get all specialists.
			 */
			this.getSpecialists = function () {
				ajaxAgent.get(_url, function (res) {
					console.log("\nGET  %s, res.body", _url, res.body);

					var specialists = {"all": "<alles>", null: "<leeg>"};

					if (res.body && res.body.items && res.body.items instanceof Array) {
						res.body.items.forEach(function (specialist) {

							specialists[specialist.VerantwoordelijkSpecialist] = (specialist.VerantwoordelijkSpecialist !== null)
								? specialist.VerantwoordelijkSpecialist
								: "null";

						});
					}
					setState(specialists);
				});
			};
		}

		SpecialistsRepository.prototype = crafity.core.EventEmitter.prototype;

		// expose to outside callers
		repositories.SpecialistsRepository = SpecialistsRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));