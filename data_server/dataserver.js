/*jslint node:true, white:true*/

"use strict";

var port = process.env.PORT || 8079;
var http = require("http");
var express = require("express");
var app = express();
var fs = require("fs");
var zlib = require("zlib"); // todo_gasl implement this
var mime = require("mime");

var database = require("./database");

var server;
var TIMEOUT_IN_MINUTES = 20;
var ORIGIN_URL = "http://dotcontroles.dev";

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

// BEGIN Auxiliary methods
function createConnection() {
	return new Connection(configSQLServer);
}

function handleServerError(err, res) {
	console.log(err.message, err.stack);
	res.writeHead(500);
	return res.end(err.message + "\n" + err.stack);
}

/**
 * Intercept every request by doing preliminary checks
 * and preparational work.
 */
app.use(function appendHeaders(req, res, next) {
	// meaning of the headers below: 
	// only the Origin Url is allowed to use this data server
	// value of Origin must match the value of Access-Control-Allow-Origin
	res.header({
		"Origin": ORIGIN_URL,
		"Access-Control-Allow-Origin": ORIGIN_URL,
		"x-powered-by": "Crafity",
		"Content-Type": "application/json; charset=utf-8"
	});
	next();
});

// END Auxiliary method

app.options("*", function (req, res) {
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Credentials, Origin, Content-Type");
	res.setHeader("Access-Control-Allow-Origin", ORIGIN_URL);
	res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.end();
});

// ROUTINGS
app.get("/", function (req, res) {
	var body = { name: "Data server", version: "0.1" };
	res.send(200, body);
});

app.post("/login", function (req, res) {
	console.log("POST /login", req.params, req.body);

	console.log("req.session", req.session);
	console.log("req.cookies", req.cookies);
	req.session.user = req.body.username;

	if (req.body.username && req.body.password) {
	}

	var body = { name: "Logged in succesfull"};
	res.send(200, body);
});

app.get("/users", function (req, res) {
	console.log("GET /users ", req.params, req.body);

	var hasRows = false;

	database.users.getAll(function (err, row, rowcount) {
		if (err) {
			throw err;
		}

		if (!hasRows) {
			res.write("[");
		}
		if (row) {
			row.href = req.url + "/" + row.Id;
			res.write((hasRows ? "," : "") + JSON.stringify(row) + "\n");
			hasRows = true;
		} else {
			res.end("]");
		}
	});
});

app.get("/users/:id", function (req, res) {
	console.log("GET /users/:id ", req.params, req.body);

	database.users.getById(req.params.id, function (err, row) {
		if (err) {
			throw err;
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

app.get("/constateringen", function (req, res) {
	console.log("GET /constateringen ", req.params, req.body);

	var offset = parseInt(req.query.offset || 0, 10);
	var limit = parseInt(req.query.limit || 5, 10);
	var _total = null;

	var _finishedSendingTotal = false;
	var _startedReceivingRows = false;
	var _finishedReceivingRows = false;

	var filters = null;
	var queryFilters = "";

	if (req.query.filters) {
		queryFilters = "&filters=" + req.query.filters;
		filters = {};
		var splitted = req.query.filters.split(',')
		splitted.forEach(function (filter) {
			var keyValue = filter.split(":");
			if (keyValue.length === 2) {
				filters[keyValue[0]] = keyValue[1];
			}
		});
	}

	function sendChunkInitial() {
		var previousUrl = null;
		if (offset > 0) {
			if (offset - limit >= 0) {
				previousUrl = '{"href": "/constateringen?offset=' + (offset - limit) + '&limit=' + limit + queryFilters + '"}';
			} else {
				previousUrl = '{"href": "/constateringen?offset=0&limit=' + limit + queryFilters + '"}';
			}
		}
		var chunkInitial = '{\n\t"href": "/constateringen",'
			+ '\n\t"offset": ' + offset + ','
			+ '\n\t"limit": ' + limit + ','
			+ '\n\t"filters": ' + JSON.stringify(filters) + ','
			+ '\n\t"first": {"href": "/constateringen?offset=0&limit=' + limit + queryFilters + '"},'
			+ '\n\t"previous": ' + previousUrl + ',';
		res.write(chunkInitial);
	}

	function sendChunkTotal(total) {
		_total = null;
		_finishedSendingTotal = true;

		var nextUrl = null;
		var lastOffset = Math.floor(total / limit) * limit;

		if (offset + limit < total) {
			nextUrl = '{ "href": "/constateringen?offset=' + (offset + limit) + '&limit=' + limit + queryFilters + '" }';
		}

		var chunkTotal = '\n\t"next": ' + nextUrl + ',' +
			'\n\t"last": { "href": "/constateringen?offset=' + lastOffset + '&limit=' + limit + queryFilters + '" },' +
			'\n\t"total": ' + total + (_finishedReceivingRows ? "" : ",");

		res.write(chunkTotal);
	}

	function sendChunkLast() {
		res.end("\n}");
	}

	sendChunkInitial();

	database.constateringen.getTotal(filters, function (err, total) {
		if (err) {
			throw err;
		}

		_total = total;

		if (!_startedReceivingRows) {

			// Zijn de items nog niet aan het streamen? -> Send total thingies
			sendChunkTotal(_total);

		} else if (_finishedReceivingRows) {

			// Zijn de items al klaar met streamen? -> Send total thingies + finalize request
			sendChunkTotal(_total);
			sendChunkLast();
		}
		// Else... Zijn de items al aan het streamen? -> Wait
	});

	var hasRows = false;
	database.constateringen.getAll(offset, limit, filters, function (err, row, rowcount) {
		if (err) {
			throw err;
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

		} else {
			// Streamen...
			res.write("\n\t\t" + (hasRows ? "," : "") + JSON.stringify(row));
			hasRows = true;
		}

	});

});

/**
 * This is a partial update (document replacement) perfprmed with
 * REST verb 'POST'
 *
 * It returns:
 *  a status code
 *  and object as a body
 */
app.post("/constateringen/:id", function (req, res) {
	console.log("POST /constateringen/:id ", req.params, req.body);

	database.constateringen.update(req.params.id, req.body, function (err, rowcount) {
		if (err) {
			throw err;
		}

		database.constateringen.getById(req.params.id, function (err, constatering) {
			if (err) {
				throw err;
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
 * This is a full (document replacement) update perfprmed with
 * REST verb 'PUT'
 *
 * It returns:
 *  a status code
 *  and object as a body
 */
app.put("/constateringen/:id", function (req, res) {
	console.log("PUT /constateringen/:id ", req.params, req.body);

	database.constateringen.updateAllProperties(req.body, function () {
		res.end();
	});

});

// By default 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
	console.log("req.body", req.body);
	res.send(404, { status: 404, message: "Unknown request" });
});

console.log("Serving content on http://localhost:" + port);

app.listen(port);