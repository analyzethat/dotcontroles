/*globals window, console, superagent, crafity*/

(function (controles) {
	"use strict";
	(function (repositories) {

		/**
		 * Specialisms repository
		 *
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function SpecialismsRepository() {
			var ajaxAgent = superagent;
			var self = this;
			//			var state = null;
			var _url = controles.URL_DATASERVER + "/specialisms";
			var _specialisms = null;

			/* Auxiliary methods */
			function setState(data) {
				self.emit("stateChanged", data);
			}
			/* End auxiliary methods */

			this.getSimpleSpecialismList = function () {
				if (!_specialisms) { throw new Error("There are not specialisms."); }
				
				var simpleList = {};
				_specialisms.forEach(function (specialism) {
					simpleList[specialism.Id] = specialism.Name;
				});
				
				return simpleList;
			};

			/**
			 * Initialize.
			 * @param controle
			 */
			this.init = function () {
				self.getSpecialisms();
				return self;
			};

			/**
			 * Get all specialisms.
			 */
			this.getSpecialisms = function () {
				
				ajaxAgent.get(_url, function (res) {
					if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", _url, res.body); }
					
					if (res.body && res.body.items && res.body.items instanceof Array) {
						_specialisms = res.body.items;
					}
					setState(_specialisms);
				});
			};
		}

		SpecialismsRepository.prototype = crafity.core.EventEmitter.prototype;

		// expose to outside callers
		repositories.SpecialismsRepository = SpecialismsRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));