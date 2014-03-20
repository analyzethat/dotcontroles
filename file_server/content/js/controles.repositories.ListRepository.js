/*globals window, superagent, crafity */
(function (controles) {
	"use strict";

	(function (repositories) {

		/**
		 * List repository - prototype for all repository objects based on collecitons.
		 *
		 * @param ajaxAgent
		 * @param dataserverUrl
		 * @constructor
		 *
		 * @author Galina Slavova <galina@crafity.com>
		 */
		function ListRespository(ajaxAgent, dataserverUrl) {
			if (!dataserverUrl) { throw new Error("Missing argument 'dataserverUrl'"); }
			if (!ajaxAgent) { throw new Error("Missing argument 'ajaxAgent'"); }

			this._ajaxAgent = ajaxAgent;
			this._dataserverUrl = dataserverUrl;
		}

		ListRespository.prototype = crafity.core.EventEmitter.prototype;
		ListRespository.prototype.limit = 12;

		ListRespository.prototype.state = function state(data) {
			if (data === undefined) { return this._state; }

			// it is a setter
			this._state = data;

			this.emit("data", data.items);
			this.emit("stateChanged", data._state);

			return this;
		};
		
		ListRespository.prototype.getPropertyFor = function (name, columnDefinitionList) {
			var res = columnDefinitionList
				.filter(function (colDefinition) {
					return (name === colDefinition.name);
				})
				.map(function (colDefinition) {
					return colDefinition.property;
				});

			if (res.length > 1) { throw new Error("Multiple properties were found for name " + name); }

			return (res && res.length > 0) ? res[0] : null;
		};

		ListRespository.prototype.hasPrevious = function () {
			return this.state().previous !== null;
		};
		ListRespository.prototype.hasNext = function () {
			return this.state().next !== null;
		};
		ListRespository.prototype.first = function () {
			var self = this;
			this._ajaxAgent.get(this._dataserverUrl + this.state().first.href, function (res) {
				self.state(res.body);
			});
		};
		ListRespository.prototype.last = function () {
			var self = this;
			this._ajaxAgent.get(this._dataserverUrl + this.state().last.href, function (res) {
				self.state(res.body);
			});
		};
		ListRespository.prototype.previous = function () {
			var self = this;
			this._ajaxAgent.get(this._dataserverUrl + this.state().previous.href, function (res) {
				self.state(res.body);
			});
		};
		ListRespository.prototype.next = function () {
			var self = this;
			this._ajaxAgent.get(this._dataserverUrl + this.state().next.href, function (res) {
				self.state(res.body);
			});
		};

		repositories.ListRepository = ListRespository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));