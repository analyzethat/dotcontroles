var port = process.env.PORT || 8077;

/*jslint node:true, white:true*/
var http = require("http")
	, fs = require('fs')
	, zlib = require('zlib')
	, mime = require('mime')
	, tedious = require('tedious')
	, Connection = tedious.Connection
	, Request = tedious.Request
	, server;

var config = {
	userName: 'node_user',
	password: 'nodeuser',
	server: '127.0.0.1',
	options: {
		database: 'dotcontroles',
		instanceName: 'SQLEXPRESS',
		rowCollectionOnRequestCompletion: false
	}
};

var connection = new Connection(config).on('connect', function (err) {
	if (err) {
		throw err;
	}

	server = http.createServer(function (req, res) {
		"use strict";

		try {

			// Check the request to see what the user wants (and if it exists otherwise 404)
			// Check if the user is logged in and is authorized for the requested action (if not 403)
			// Get the actual data...

			res.writeHead(200, {
				'Content-Type': 'application/json'
			});

			var request = new Request('select * from controles', function (err, rowcount) {
				console.log("REQUEST");
				if (err) {
					throw err;
				}
				res.end();
				//console.log("rowcount", rowcount);
			});

			request.on('row', function (columns) {
				console.log("ROW");

				var row = {};

				columns.forEach(function (column) {
					row[column.metadata.colName] = column.value;
				});

				res.write(JSON.stringify(row) + "\n");
			});

			request.on('done', function () {
				console.log("DONE");
			});

			connection.execSql(request);

			//return raw.pipe(zlib.createGzip()).pipe(res);

		} catch (err) {
			return handleError(err, res);
		}
	});

	function handleError(err, res) {
		console.log(err.message, err.stack);
		res.writeHead(500);
		return res.end(err.message + "\n" + err.stack);
	}

	server.listen(port);

	console.log("Serving content on http://localhost:" + port);

});
	