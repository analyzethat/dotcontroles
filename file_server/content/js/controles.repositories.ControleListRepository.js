/*globals window, console, superagent, crafity*/

(function (controles) {
	"use strict";
	(function (repositories) {

		/**
		 * Statuses repository
		 *
		 * @constructor
		 *
		 * @author Johan van den Brink <johan@analyzethat.nl>
		 */
		function ControleListRepository() {
			var ajaxAgent = superagent;
			var self = this;
			var _url = controles.URL_DATASERVER + "/controle";
			var controleList = {};

			/* Auxiliary methods */
			function setState(data) {
				self.emit("stateChanged", data);
			}

			/* End auxiliary methods */

			/**
			 * Initialize.
			 * @param controle
			 */
			this.init = function () {
				self.getControleList();
				return self;
			};

			/**
			 * Get all statuses.
			 */
			this.getControleList = function () {

				ajaxAgent.get(_url, function (res) {
					if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", _url, res.body); }


					if (res.body && res.body.items && res.body.items instanceof Array) {
                         res.body.items.forEach(function (controle) {
                            controleList[controle.Id] = controle.Name;
                        });

                        //controleList = res.body.items;
					}
					setState(controleList);
				});
			};
		}

		ControleListRepository.prototype = crafity.core.EventEmitter.prototype;

		// expose to outside callers
		repositories.ControleListRepository = ControleListRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));