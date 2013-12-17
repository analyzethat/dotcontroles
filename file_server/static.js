var port = process.env.PORT || 8077;

/*jslint node:true, white:true*/
var http = require('http')
	, fs = require('fs')
	, zlib = require('zlib')
	, mime = require('mime')
	, server;

server = http.createServer(function (req, res) {
	"use strict";

	try {
		var url = "./content" + (req.url === "/" ? "/index.html" : req.url.split('?')[0])
			, raw = fs.createReadStream(url);

		raw.on('error', function (err) {
			console.log("arguments", arguments);
			if (err.message.indexOf("ENOENT, open '") === 0) {
				res.writeHead(404);
			} else {
				res.writeHead(500);
			}
			return res.end(err.message + "\n" + err.stack);
		});

		res.writeHead(200, {
			'Content-Type': mime.lookup(url),
			'Content-Encoding': 'gzip'
		});

		return raw.pipe(zlib.createGzip()).pipe(res);

	} catch (err) {
		console.log(err.message, err.stack);
		res.writeHead(500);
		return res.end(err.message + "\n" + err.stack);
	}
});

server.listen(port);

console.log("Serving content on http://localhost:" + port);