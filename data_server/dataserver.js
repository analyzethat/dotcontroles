/*jslint node:true, white:true*/

"use strict";


var port = process.env.PORT || 8079;
var http = require("http");
var express = require("express");
var app = express();
var fs = require("fs");
var zlib = require("zlib"); // todo_gasl implement this
var mime = require("mime");
var core = require("crafity-core");
var Synchronizer = core.Synchronizer;
var config = JSON.parse(fs.readFileSync("config.json").toString());
/*
 * Logging Level codes
 * 1. Error 
 * 2. Error + Warning
 * 3. Error + Warning + Info
 */
var loggerLevel = config.logger.level;

var database = require("./database");

var server;
var TIMEOUT_IN_MINUTES = 20;
var ORIGIN_URLs = ["http://dotcontroles.dev", "http://dotcontroles.crafity.com"];

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
	key: "app.sess",
	secret: 'SEKR37'
}));


//app.use(app.router);

//app.use(express.cookieSession({
//	key: "app.sess",
//	cookie: { maxAge: new Date(new Date().setMinutes(new Date().getMinutes() + TIMEOUT_IN_MINUTES)) }
//}));

/* Auxiliary methods */
function handleServerError(err, res) {
	if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
	res.writeHead(500);
	return res.end(err.message + "\n" + err.stack);
}

function parseFilters(requestFilters) {
	var filters = {};
	var splitted = requestFilters.split('|');

	splitted.forEach(function (filter) {
		var keyValue = filter.split(":");

		if (keyValue.length === 2) {

			var value = decodeURIComponent(keyValue[1]);
			// if starts a left bracket and ends with a right brackets []
			if (value.indexOf("[") === 0 && (value.indexOf("]") === value.length - 1)) {
				value = value.substring(1, value.length - 1);
			}
			filters[keyValue[0]] = value;

		}
		else {
			throw new Error("Filter has multiple sections separated by colon");
		}
	});

	return filters;
}
/* End auxiliary methods */

/**
 * Intercept every request by doing preliminary checks
 * and preparational work.
 */
app.use(function appendHeaders(req, res, next) {
	var headersObject = {
		"x-powered-by": "Crafity",
		"Content-Type": "application/json; charset=utf-8"
	};

	if (core.arrays.contains(ORIGIN_URLs, req.headers.origin)) {
		headersObject["Origin"] = req.headers.origin;
		headersObject["Access-Control-Allow-Origin"] = req.headers.origin;
	}

	// meaning of the headers below: 
	// only the Origin Url is allowed to use this data server
	// value of Origin must match the value of Access-Control-Allow-Origin
	res.header(headersObject);
	next();
});

/**
 * Regardless the HTTP verb set the proper cross domain headers properly.
 */
app.options("*", function (req, res) {
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Credentials, Origin, Content-Type");

	if (core.arrays.contains(ORIGIN_URLs, req.headers.origin)) {
		res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
	}
	res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.setHeader("Access-Control-Allow-Credentials", "true");

	res.end();
});

/* Beging ROUTINGS */
app.get("/", function (req, res) {
	var body = { name: "Data server", version: "0.1" };
	res.send(200, body);
});

app.post("/login", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** POST /login *********************\n", req.params, req.body); }
	//console.log("\nreq.session", req.session);
	//console.log("\nreq.cookies", req.cookies);
	req.session.user = req.body.username;

	database.users.getByCredentials(req.body.username, req.body.password, function (err, user) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.send(500, {"status": 500, "message": err.message});
		}
		if (!user) {
			return res.send(404, {
				"status": 404,
				"message": "User '" + req.body.username + "' is not found."
			});
		}

		var synchronizer = new Synchronizer();
		var body = { href: req.url, user: user };

		database.users.getRolesByUserId(user.Id, synchronizer.register("roles"));
		database.users.getSpecialismsByUserId(user.Id, synchronizer.register("specialisms"));

		synchronizer.on('finished', function (err, result) {
			if (err) {
				if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
				return res.send(500, {"status": 500, "message": err.toString()});
			}

			body.user.Roles = result.roles || [];
			body.user.Specialisms = result.specialisms || [];

			res.send(200, body);
		});

	});
});

app.get("/users", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** GET /users *********************\n", req.params, req.body); }

	var hasRows = false;

	database.users.getAll(function (err, row, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!hasRows) {
			res.write('{\n"href": "/users",');
			res.write('\n"items": [\n');
		}
		if (row) {
			row.href = req.url + "/" + row.Id;
			res.write("\t" + (hasRows ? "," : "") + JSON.stringify(row) + "\n");
			hasRows = true;
		}
		else {
			res.write("\t]");
			res.end("\n}");
		}
	});
});

app.get("/users/:id", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** GET /users/:id *********************\n", req.params, req.body); }
	database.users.getById(req.params.id, function (err, row) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!row) {
			return res.send(404, {
				"status": 404,
				"message": "User with id '" + req.params.id + "' is not found."
			});
		}

		row.href = req.url;
		res.send(200, row);

	});

});

app.get("/specialisms", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** GET /specialisms *********************\n", req.params, req.body); }

	var hasRows = false;

	database.specialisms.getAll(function (err, row, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!hasRows) {
			res.write('{\n"href": "/specialisms",');
			res.write('\n"items": [\n');
		}
		if (row) {
			row.href = req.url + "/" + row.Id;
			res.write("\t" + (hasRows ? "," : "") + JSON.stringify(row) + "\n");
			hasRows = true;
		}
		else {
			res.write("\t]");
			res.end("\n}");
		}
	});
});

app.get("/statuses", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** GET /statuses *********************\n", req.params, req.body); }

	var hasRows = false;

	database.statuses.getAll(function (err, row, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!hasRows) {
			res.write('{\n"href": "/statuses",');
			res.write('\n"items": [\n');
		}
		if (row) {
			row.href = req.url + "/" + row.Id;
			res.write("\t" + (hasRows ? "," : "") + JSON.stringify(row) + "\n");
			hasRows = true;
		}
		else {
			res.write("\t]");
			res.end("\n}");
		}
	});
});

app.get("/specialists", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** GET /specialists *********************\n", req.params, req.body); }

	var hasRows = false;
	database.specialists.getAll(function (err, row, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!hasRows) {
			res.write('{\n"href": "/specialists",');
			res.write('\n"items": [\n');
		}

		if (row) {
			res.write("\t" + (hasRows ? "," : "") + JSON.stringify(row) + "\n");
			hasRows = true;

		}
		else {
			res.write("\t]");
			res.end("\n}");
		}

	});
});

app.get("/controle", function (req, res) {
    if (loggerLevel > 2) { console.log("\n**************************** GET /controleList *********************\n", req.params, req.body); }

    var hasRows = false;
    database.controles.getSelectList(function (err, row, rowcount) {
        if (err) {
            if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
            return res.end();
        }

        if (!hasRows) {
            res.write('{\n"href": "/controle",');
            res.write('\n"items": [\n');
        }

        if (row) {
            res.write("\t" + (hasRows ? "," : "") + JSON.stringify(row) + "\n");
            hasRows = true;

        }
        else {
            res.write("\t]");
            res.end("\n}");
        }

    });
});

app.get("/controles/:id", function (req, res) {
    if (loggerLevel > 2) { console.log("\n**************************** GET /controles/:id *********************\n", req.params, req.body); }

    database.controles.getById(req.params.id, function (err, row) {
        if (err) {
            if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
            return res.end();
        }

        if (!row) {
            return res.send(404, {
                "status": 404,
                "message": "Controle with id '" + req.params.id + "' is not found."
            });
        }

        row.href = req.url;
        res.send(200, row);

    });

});

app.get("/controles", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** GET /controles *********************\n", req.params, req.body); }

	var offset = parseInt(req.query.offset || 0, 10);
	var limit = parseInt(req.query.limit || 5, 10);
	var _total = null;

	var _finishedSendingTotal = false;
	var _startedReceivingRows = false;
	var _finishedReceivingRows = false;

	var queryStringFilters = "";
	var filters = null;
	if (req.query.filters) {
		queryStringFilters = "&filters=" + encodeURIComponent(req.query.filters);
		filters = req.query.filters ? parseFilters(req.query.filters) : null;
	}

	function sendChunkInitial() {
		var previousUrl = null;
		if (offset > 0) {
			if (offset - limit >= 0) {
				previousUrl = '{"href": "/controles?offset=' + (offset - limit) + '&limit=' + limit + queryStringFilters + '"}';
			}
			else {
				previousUrl = '{"href": "/controles?offset=0&limit=' + limit + queryStringFilters + '"}';
			}
		}

		var chunkInitial = '{\n\t"href": "/controles",'
			+ '\n\t"offset": ' + offset + ','
			+ '\n\t"limit": ' + limit + ','
			+ '\n\t"filters": ' + JSON.stringify(filters) + ','
			+ '\n\t"first": {"href": "/controles?offset=0&limit=' + limit + queryStringFilters + '"},'
			+ '\n\t"previous": ' + previousUrl + ',';
		res.write(chunkInitial);
	}

	function sendChunkTotal(total) {
		_total = null;
		_finishedSendingTotal = true;

		var nextUrl = null;
		var lastOffset = Math.floor(total / limit) * limit;

		if (offset + limit < total) {
			nextUrl = '{ "href": "/controles?offset=' + (offset + limit) + '&limit=' + limit + queryStringFilters + '" }';
		}

		var chunkTotal = '\n\t"next": ' + nextUrl + ',' +
			'\n\t"last": { "href": "/controles?offset=' + lastOffset + '&limit=' + limit + queryStringFilters + '" },' +
			'\n\t"total": ' + total + (_finishedReceivingRows ? "" : ",");

		res.write(chunkTotal);
	}

	function sendChunkLast() {
		res.end("\n}");
	}

	sendChunkInitial();

	database.controles.getTotal(filters, function (err, total) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		_total = total;

		if (!_startedReceivingRows) {

			// Zijn de items nog niet aan het streamen? -> Send total thingies
			sendChunkTotal(_total);

		}
		else if (_finishedReceivingRows) {

			// Zijn de items al klaar met streamen? -> Send total thingies + finalize request
			sendChunkTotal(_total);
			sendChunkLast();
		}
		// Else... Zijn de items al aan het streamen? -> Wait
	});

	var hasRows = false;
	database.controles.getFilteredBy(offset, limit, filters, function (err, row, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!_startedReceivingRows) {
			res.write('\n\t"items": [');
			_startedReceivingRows = true;
		}

		if (!row) {
			res.write("\n\t]" + (_finishedSendingTotal ? "" : ","))
			_finishedReceivingRows = true;

			// Klaar met streamen. Kijk of de total klaar staat om nog te versturen?
			if (_total) {
				//    -> Ja: Send total thingies 
				sendChunkTotal(_total);
			}
			if (_finishedSendingTotal) {
				//    -> Nee: finalize request (total is blijkbaar al verzonden)
				sendChunkLast();
			}

		}
		else {
			// Streamen...
			res.write("\n\t\t" + (hasRows ? "," : "") + JSON.stringify(row));
			hasRows = true;
		}

	});

});

app.get("/controleheader/:id", function (req, res) {
    if (loggerLevel > 2) { console.log("\n**************************** GET /controleheader/:id *********************\n", req.params, req.body); }
    console.log(req);
    database.controleHeaders.getById(req.params.id, function (err, row) {
        if (err) {
            if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
            return res.end();
        }

        if (!row) {
            return res.send(404, {
                "status": 404,
                "message": "Controleheader with id '" + req.params.id + "' is not found."
            });
        }

        row.href = req.url;
        res.send(200, row);

    });

});


app.get("/constateringen", function (req, res) {
	if (loggerLevel > 2) {
		console.log("\n**************************** GET /constateringen *********************\n", req.params, req.body);
		console.log("\nreq.query.filters", req.query.filters);
	}

	var offset = parseInt(req.query.offset || 0, 10);
	var limit = parseInt(req.query.limit || 5, 10);
	var _total = null;

	var _finishedSendingTotal = false;

	var _startedReceivingConstateringenRows = false;
	var _finishedReceivingConstateringenRows = false;

	var filters = null;
	var queryStringFilters = "";

	if (req.query.filters) {
		queryStringFilters = "&filters=" + encodeURIComponent(req.query.filters);
		filters = req.query.filters ? parseFilters(req.query.filters) : null;
	}

	function sendChunkInitial() {
		var previousUrl = null;
		if (offset > 0) {
			if (offset - limit >= 0) {
				previousUrl = '{"href": "/constateringen?offset=' + (offset - limit) + '&limit=' + limit + queryStringFilters + '"}';
			}
			else {
				previousUrl = '{"href": "/constateringen?offset=0&limit=' + limit + queryStringFilters + '"}';
			}
		}
		var chunkInitial = '{\n\t"href": "/constateringen",'
			+ '\n\t"offset": ' + offset + ','
			+ '\n\t"limit": ' + limit + ','
			+ '\n\t"filters": ' + JSON.stringify(filters) + ','
			+ '\n\t"first": {"href": "/constateringen?offset=0&limit=' + limit + queryStringFilters + '"},'
			+ '\n\t"previous": ' + previousUrl + ',';
		res.write(chunkInitial);
	}

	function sendChunkTotal(total) {
		_total = null;
		_finishedSendingTotal = true;

		var nextUrl = null;
		var lastOffset = Math.floor(total / limit) * limit;

		if (offset + limit < total) {
			nextUrl = '{ "href": "/constateringen?offset=' + (offset + limit) + '&limit=' + limit + queryStringFilters + '" }';
		}

		var chunkTotal = '\n\t"next": ' + nextUrl + ',' +
			'\n\t"last": { "href": "/constateringen?offset=' + lastOffset + '&limit=' + limit + queryStringFilters + '" },' +
			'\n\t"total": ' + total + (_finishedReceivingConstateringenRows ? "" : ",");

		res.write(chunkTotal);
	}

	function sendChunkLast() {
		res.end("\n}");
	}

	sendChunkInitial();

	database.constateringen.getTotal(filters, function (err, total) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		_total = total;

		if (!_startedReceivingConstateringenRows) {

			// Zijn de items nog niet aan het streamen? -> Send total thingies
			sendChunkTotal(_total);

		}
		else if (_finishedReceivingConstateringenRows) {

			// Zijn de items al klaar met streamen? -> Send total thingies + finalize request
			sendChunkTotal(_total);
			sendChunkLast();
		}
		// Else... Zijn de items al aan het streamen? -> Wait
	});

	var hasRows = false;
	database.constateringen.getFilteredBy(offset, limit, filters, function (err, row, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		if (!_startedReceivingConstateringenRows) {
			res.write('\n\t"items": [');
			_startedReceivingConstateringenRows = true;
		}

		if (!row) {
			res.write("\n\t]" + (_finishedSendingTotal ? "" : ","));
			_finishedReceivingConstateringenRows = true;

			// Finished streaming rows. Is the total also ready to be sent?
			if (_total) {
				//    -> Ja: Send total thingies 
				sendChunkTotal(_total);
			}
			if (_finishedSendingTotal) {
				//    -> Nee: finalize request (total is blijkbaar al verzonden)
				sendChunkLast();
			}

		}
		else {
			// Streaming...
			res.write("\n\t\t" + (hasRows ? "," : "") + JSON.stringify(row));
			hasRows = true;
		}

	});

});

/**
 * This is a partial update performed with
 * REST verb 'POST'
 *
 * It returns:
 *  a status code
 *  and object as a body
 */

app.post("/controles/:id", function (req, res) {
    if (loggerLevel > 2) { console.log("\n**************************** POST /controles/:id *********************\n", req.params, req.body); }

    database.controles.update(req.params.id, req.body, function (err, rowcount) {
        if (err) {
            if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
            return res.end();
        }

        database.controles.getById(req.params.id, function (err, controle) {
            if (err) {
                if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
                return res.end();
            }

            if (!controle) {
                return res.send(404, {
                    "status": 404,
                    "message": "Controle with id '" + req.params.id + "' is not found."
                });
            }

            controle.href = req.url;
            res.send(200, controle);
        });

    });

});


app.post("/constateringen/:id", function (req, res) {
	if (loggerLevel > 2) { console.log("\n**************************** POST /constateringen/:id *********************\n", req.params, req.body); }

	database.constateringen.update(req.params.id, req.body, function (err, rowcount) {
		if (err) {
			if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
			return res.end();
		}

		database.constateringen.getById(req.params.id, function (err, constatering) {
			if (err) {
				if (loggerLevel > 0) { console.error(err.stack || err.toString()); }
				return res.end();
			}

			if (!constatering) {
				return res.send(404, {
					"status": 404,
					"message": "Constateringen with id '" + req.params.id + "' is not found."
				});
			}

			constatering.href = req.url;
			res.send(200, constatering);
		});

	});

});

/**
 * This is a full (document replacement) update performed with
 * REST verb 'PUT'
 *
 * It returns:
 *  a status code
 *  and object as a body
 */
app.put("/constateringen/:id", function (req, res) {
	if (loggerLevel > 2) { console.log("\n************* PUT /constateringen/:id *********************\n", req.params, req.body); }

	database.constateringen.updateAllProperties(req.body, function () {
		res.end();
	});

});

// By default 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
	if (loggerLevel > 2) { console.log("\n************* GET * *********************\n", req.params, req.body); }

	res.send(404, { status: 404, message: "Unknown request" });
});

/* End ROUTINGS */

console.log("Serving content on http://localhost:" + port);

app.listen(port);