/*globals window, console*/

(function (controles) {
	"use strict";
	(function (repositories) {

		/**
		 * 
		 * @constructor
		 * 
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function SpecialistsRepository() {
			var ajaxAgent = superagent;
			var self = this;
			var state = null;

			function setState(data) {
				state = data;
				console.log("\n\nNew update specialists: ", state);

				self.emit('stateChanged', state);
			}

			this.getSpecialists = function () {
				var url = controles.URL_DATASERVER + "/specialists";

				ajaxAgent.get(url, function (res) {
					console.log("\n\nURL: ", url, res.body);
					
					var specialists = {"all": "<alles>", null: "<leeg>"};

					if (res.body && res.body.items && res.body.items instanceof Array) {
						console.log("getSpecialists => res.body", res.body);

						res.body.items.forEach(function (specialist) {

								specialists[specialist.VerantwoordelijkSpecialist] = (specialist.VerantwoordelijkSpecialist !== null) 
									? specialist.VerantwoordelijkSpecialist
									: "null";
							
						});
					}
					console.log("specialists", specialists);
					setState(specialists);
				});
			};

			this.init = function () {
				self.getSpecialists();
			};
			
		}

		SpecialistsRepository.prototype = crafity.core.EventEmitter.prototype;

		// expose to outside callers
		repositories.SpecialistsRepository = SpecialistsRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));