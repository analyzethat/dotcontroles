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
		 * @author Johan van den Brink <johan@analyzethat.nl>
		 */
		function ControleHeaderRepository(controle, specialismList, statusList) {
            if (!controle) { throw new Error("Missing argument 'controle'."); }
            if (!specialismList) { throw new Error("Missing argument 'specialismList'."); }
            if (!statusList) { throw new Error("Missing argument 'statusList'."); }

            var ajaxAgent = superagent;
            var self = this;
            var state = null;
            var _specialismList = specialismList;
            var _statusList = statusList;
            var _url = this._dataserverUrl + "/controleheader/";
            var _controleId = controle.Id;
            function setState(data) {
                state = data;
                self.emit("stateChanged", data);
            }

            this.init = function () {
                self.getControleHeader();
                return self;
            };

            /**
             * Get header row from database for the Constateringen grid
             *
             * @param id
             */

            this.getControleHeader = function () {

                var self = this;
                var _result = {};
                var _columnHeader = {};
                var id = _controleId;

                if (!id) { throw new Error("Missing argument 'id' in getControleHeader function"); }

                return ajaxAgent.get(_url + id, function (res) {
                    if (config.logger.level > 2) { console.log("\nGET  '%s', res.body", _url + id, res.body); }
                    if (res.body) {
                        _result = res.body;
                        for(var key in _result) {
                            if(key != "href") {
                                _columnHeader =_result[key];
                                var columnProperties = {};
                                for(var prop in _columnHeader) {
                                    //console.log(prop + " : " +_columnHeaders[prop]);
                                    switch(prop){
                                        case "ExternalName":
                                            //console.log("name: " + _columnHeaders[prop]);
                                            columnProperties.name = _columnHeader[prop];
                                            break;
                                        case "InternalName":
                                            //console.log("property: " + _columnHeaders[prop]);
                                            columnProperties.property = _columnHeader[prop];
                                            break;
                                        case "Type":
                                            //console.log("type: " + _columnHeaders[prop]);
                                            columnProperties.type = _columnHeader[prop];
                                            if(_columnHeader[prop] == "date") {columnProperties.format = "DD-MM-YYYY";}
                                            break;
                                        case "Sortable":
                                            if(_columnHeader[prop] == "false") {
                                                //console.log("sortable: " + "none")
                                                columnProperties.sortable = "none";
                                            }
                                            break;
                                        default:
                                            throw new Error("Unknown column properties in getControleHeader function");
                                    };

                                }
                                self.columnDefinitionList.push(columnProperties);
                            };


                        };

                        // fill the optionlists based on the lists passed as parameter into this repository
                        self.columnDefinitionList[0].options = _specialismList; // fills options property of first element of columndefinitionlist
                        self.columnDefinitionList[1].options = _statusList; // fills options property of element of columndefinitionlist

                        //console.log(self.columnDefinitionList);
                        setState(self.columnDefinitionList); // state derives from ListRepository

                    }
                });
            };
            // basic columnlist with the standard columns included
            this.columnDefinitionList = [
                {
                    name: "Eigenaar",
                    property: "SpecialismId",
                    type: "Number",
                    options: null,
                    editable: {
                        control: "crafity.html.Selectbox",
                        "default": 2,
                        "events": [
                            { selected: "selectedSpecialism" }
                        ]
                    },
                    sortable: "none"
                },
                {
                    name: "Naar Status",
                    property: "StatusId",
                    type: "Number",
                    options: null,
                    editable: {
                        control: "crafity.html.Selectbox",
                        "default": 4,
                        "events": [
                            { selected: "selectedStatus" }
                        ]
                    }
                },
                {
                    name: "Laatste Mutatie",
                    property: "LastMutationDate",
                    type: "Date",
                    sortable: "none",
                    format: "DD-MM-YYYY"
                }
            ];



		}




		/**
		 * Become a child of the ListRepository object
		 */
		ControleHeaderRepository.prototype = new controles.repositories.ListRepository(superagent, controles.URL_DATASERVER);
		/**
		 * Ensure that 'instanceof' will point to the type ControleRepository and not the prototype
		 */
		ControleHeaderRepository.prototype.constructor = controles.repositories.ConstateringenRepository;

		/**
		 * Expose to outside callers
		 * @type {ControleRepository}
		 */
		repositories.ControleHeaderRepository = ControleHeaderRepository;

	}(controles.repositories = controles.repositories || {}));

}(window.controles = window.controles || {}));