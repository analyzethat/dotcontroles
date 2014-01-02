/*jslint node:true, white:true*/

"use strict";

var port = process.env.PORT || 8079;
var http = require("http");
var express = require("express");
var app = express();
var fs = require("fs");
var zlib = require("zlib"); // todo_gasl implement this
var mime = require("mime");
var tedious = require("tedious");
var Connection = tedious.Connection;
var Request = tedious.Request;
var server;
var TIMEOUT_IN_MINUTES = 20;
var ORIGIN_URL = "http://dotcontroles.dev";

var configSQLServer = {
	userName: "node_user",
	password: "nodeuser",
	server: "192.168.145.129",
	options: {
		database: "dotcontroles",
		instanceName: "SQLEXPRESS",
		rowCollectionOnRequestCompletion: false
	}
};

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

function setHttpResponseHeader(res, body) {
	res.setHeader("Content-Type", "application/json");

	if (body) {
		res.setHeader("Content-Length", body.length);
	}

	// meaning of the headers below: 
	// only the Origin Url is allowed to use this data server
	// value of Origin must match the value of Access-Control-Allow-Origin
	res.setHeader("Origin", ORIGIN_URL);
	res.setHeader("Access-Control-Allow-Origin", ORIGIN_URL);

}

var database = {

	createConnection: function (callback) {
		var connection = new Connection(configSQLServer).on("connect", function (err) {
			callback(err, !err && connection);
		});
	},

	constateringen: {
		getTotal: function (callback) {
			database.createConnection(function (err, connection) {
				if (err) {
					return callback(err);
				}

				var query = "SELECT count('x') as total FROM Constateringen";
				var total = 0;
				var request = new Request(query, function (err) {
					return callback(err, !err && total);
				});
				request.on("row", function (columns) {
					total = columns.total.value;
				});
				connection.execSql(request);
			});
		}
	}

};

// END Auxiliary method

//var connection = createConnection().on("connect", function (err) {
//	if (err) {
//		throw err;
//	}

app.options("*", function (req, res) {
	console.log("\n\n\n GOTCHA !  req", req);
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Credentials, Origin");
	res.setHeader("Access-Control-Allow-Origin", ORIGIN_URL);
	res.setHeader("Access-Control-Allow-Methods", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.end();
});

// ROUTINGS
app.get("/", function (req, res) {
//	console.log(" APP.GET(/......");

	var body = JSON.stringify({ name: "Data server", version: "0.1" });
	setHttpResponseHeader(res, body);
	res.end(body);
});

app.post("/login", function (req, res) {
	console.log("req.body", req.body);
	console.log("req.session", req.session);
	console.log("req.cookies", req.cookies);
	req.session.user = req.body.username;

	if (req.body.username && req.body.password) {
	}

	var body = JSON.stringify({ name: "Logged in succesfull"});

	setHttpResponseHeader(res, body);
	res.end(body);
});

app.get("/user/:id", function (req, res) {

	var connection = createConnection().on("connect", function (err) {
		if (err) throw err;

		setHttpResponseHeader(res);

		try {

			res.write("[");

			var request = new Request("select * from users where id = " + req.params.id, function (err, rowcount) {
				console.log("DONE, select * from users where id = " + req.params.id);
				console.log("rowcount", rowcount);
				if (err) {
					throw err;
				}
				res.end("]");
			});

			request.on("row", function (columns) {
				var row = {};

				columns.forEach(function (column) {
					row[column.metadata.colName] = column.value;
				});

				res.write(JSON.stringify(row));
			});

			connection.execSql(request);

		} catch (err) {
			return handleServerError(err, res);
		}
	});
});

app.get("/users", function (req, res) {
	console.log("URL = /users");

	var connection = createConnection().on("connect", function (err) {
		if (err) throw err;

		setHttpResponseHeader(res);
		var hasRows = false;

		try {

			res.write("[");

			var request = new Request("select * from users", function (err, rowcount) {
				console.log("DONE, select * from users");

				if (err) throw err;

				res.end("]");
			});

			request.on("row", function (columns) {
				console.log("ROW");

				var row = {};

				columns.forEach(function (column) {
					row[column.metadata.colName] = column.value;
				});

				res.write((hasRows ? "," : "") + JSON.stringify(row) + "\n");
				hasRows = true;
			});

			connection.execSql(request);

		} catch (err) {
			return handleServerError(err, res);
		}
	});

});

app.get("/constateringen", function (req, res) {

	var offset = parseInt(req.query.offset || 0, 10);
	var limit = parseInt(req.query.limit || 5, 10);

	database.constateringen.getTotal(function (err, total) {
		if (err) {
			throw err;
		}

		var connection = createConnection().on("connect", function (err) {
			if (err) {
				throw err;
			}

			setHttpResponseHeader(res);
			var hasRows = false;

			try {
				// Check the request to see what the user wants (and if it exists otherwise 404)
				// Check if the user is logged in and is authorized for the requested action (if not 403)
				// Get the actual data...

				var previousUrl = null;
				if (offset > 0) {
					if (offset - limit >= 0) {
						previousUrl = '{"href": "/constateringen?offset=' + (offset - limit) + '&limit=' + limit + '"}';
					} else {
						previousUrl = '{"href": "/constateringen?offset=0&limit=' + limit + '"}';
					}
				}

				var nextUrl = null;
				if (offset + limit < total) {
					nextUrl = '{"href": "/constateringen?offset=' + (offset + limit) + '&limit=' + limit + '"}';
				}

				var string = '{\n"href": "/constateringen",'
					+ '\n"offset": 0,'
					+ '\n"limit": ' + limit + ','
					+ '\n"first": {"href": "/constateringen?offset=0&limit=' + limit + '"},'
					+ '\n"previous": ' + previousUrl + ','
					+ '\n"next": ' + nextUrl + ','
					+ '\n"items": [\n';

				res.write(string);

				var query = 'SELECT * FROM  Constateringen ORDER BY Id ASC OFFSET '
					+ offset
					+ ' ROWS FETCH NEXT '
					+ limit
					+ ' ROWS ONLY ';

				var request = new Request(query, function (err, rowcount) {
					if (err) throw err;

					var lastOffset = Math.floor(total / limit) * limit;
					res.end('],\n"last": { "href": "/constateringen?offset=' + lastOffset + '&limit=' + limit + '" }\n}');
				});

				request.on("row", function (columns) {
//				console.log("ROW");

					var row = {};

					columns.forEach(function (column) {
						row[column.metadata.colName] = column.value;
					});

					res.write((hasRows ? ",\n" : "") + JSON.stringify(row) + "\n");
					hasRows = true;
				});

				connection.execSql(request);

			} catch (err) {
				return handleServerError(err, res);
			}

		});

	});
});

// By default 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
	console.log("req.body", req.body);

	res.setHeader("Access-Control-Allow-Origin", ORIGIN_URL);
	res.setHeader("Content-Type", "text/plain");
	res.send("NOT FOUND!", 404);
});

console.log("Serving content on http://localhost:" + port);

app.listen(port);
