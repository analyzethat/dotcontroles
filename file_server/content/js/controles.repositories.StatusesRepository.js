/*globals window, console, superagent, crafity*/

(function (controles) {
	"use strict";
	(function (repositories) {

		/**
		 * Statuses repository
		 *
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function StatusesRepository() {
			var ajaxAgent = superagent;
			var self = this;
			var _url = controles.URL_DATASERVER + "/statuses";
			var _statuses = null;

			/* Auxiliary methods */
			function setState(data) {
				self.emit("stateChanged", data);
			}

			/* End auxiliary methods */

			this.getSpecialStatusList = function () {
				if (!_statuses) { throw new Error("There are not statuses."); }

				var simpleList = {};
				_statuses.forEach(function (status) {
					if (
                        status.Name.toLowerCase() === "negeren" ||
                        status.Name.toLowerCase() === "afgehandeld" ||
                        status.Name.toLowerCase() === "open"||
                        status.Name.toLowerCase() === "doorgezet")
                    {
						simpleList[status.Id] = status.Name;
					}
				});

				return simpleList;
			};

			/**
			 * Initialize.
			 * @param controle
			 */
			this.init = function () {
				self.getStatuses();
				return self;
			};

			/**
			 * Get all statuses.
			 */
			this.getStatuses = function () {

				ajaxAgent.get(_url, function (res) {
					if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", _url, res.body); }

					if (res.body && res.body.items && res.body.items instanceof Array) {
						_statuses = res.body.items;
					}
					setState(_statuses);
				});
			};
		}

		StatusesRepository.prototype = crafity.core.EventEmitter.prototype;

		// expose to outside callers
		repositories.StatusesRepository = StatusesRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));