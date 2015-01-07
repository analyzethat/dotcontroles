/*globals alert, superagent, window, console*/

(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 * User repository.
		 *
		 * @param authenticatedUser
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ControleRepository(authenticatedUser) {
            var ajaxAgent = superagent;
            var self = this;
            var state = null;
            var _url = this._dataserverUrl + "/controles/";
            var _user = authenticatedUser;

            function setState(data) {
                state = data;
                self.emit("stateChanged", data);
            }

            this.getControle = function (id) {

                var self = this;

                if (!id) { throw new Error("Missing argument 'id' in getControle function"); }

                return ajaxAgent.get(_url + id, function (res) {
                    if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", _url + id, res.body); }
                    if (res.body) {
                        setState(res.body); // state derives from ListRepository
                    }
                });
            };


            this.saveControleData = function (id, Code, Name, Type) {
                self._ajaxAgent.post(self._dataserverUrl + "/controles/" + id)
                    .send({Code: Code, Name: Name, Type: Type, FunctionalRoleId: 1})
                    .end(function (res) {
                        if (config.logger.level > 2) { console.log("\n\n\nResult from saving controle data to database: res", res); }
                    });
            };

		}




		/**
		 * Become a child of the ListRepository object
		 */
		ControleRepository.prototype = new controles.repositories.ListRepository(superagent, controles.URL_DATASERVER);
		/**
		 * Ensure that 'instanceof' will point to the type ControleRepository and not the prototype
		 */
		ControleRepository.prototype.constructor = controles.repositories.ConstateringenRepository;

		/**
		 * Expose to outside callers
		 * @type {ControleRepository}
		 */
		repositories.ControleRepository = ControleRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));