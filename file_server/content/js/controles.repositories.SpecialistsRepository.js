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
			var state = null;

//			var dummySpecialists = {"all": "<alles>", null: "<leeg>", "Jansen": "Jansen", "Pulles": "Pulles"};

			function setState(data) {
				state = data;
				console.log("\n\nNew update specialists: ", state);

				self.emit('stateChanged', state);
			}

			this.getSpecialists = function () {
				var url = dataserverUrl + "/specialists";

				ajaxAgent.get(url, function (res) {
					console.log("\n\nURL: ", url, res.body);

					// RESULT
//					[{"VerantwoordelijkSpecialist":null}
//					,{"VerantwoordelijkSpecialist":"Benedikt"}
//					,{"VerantwoordelijkSpecialist":"Jansen"}
//					,{"VerantwoordelijkSpecialist":"Pulles"}
//					]
					
					var specialists = {"all": "<alles>", null: "<leeg>"};

					if (res.body && res.body instanceof Array) {
						console.log("getSpecialists => res.body", res.body);

						res.body.forEach(function (specialist) {

								specialists[specialist.VerantwoordelijkSpecialist] = (specialist.VerantwoordelijkSpecialist !== null) 
									? specialist.VerantwoordelijkSpecialist
									: "null";
							
						});
					}
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