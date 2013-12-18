"use strict";

var port = process.env.PORT || 8077;

/*jslint node:true, white:true*/
var http = require('http')
	, fs = require('fs')
	, zlib = require('zlib')
	, stylus = require('stylus')
	, mime = require('mime')
	, server;

server = http.createServer(function (req, res) {
	console.log("Requesting:", req.url);

	try {
		
		var filePath = "./content" + (req.url === "/" ? "/index.html" : req.url.split('?')[0]);
		var mimeType = mime.lookup(filePath);
		var content = "";
		
		var isCSS = !!filePath.match(/\.css$/i);
		if (isCSS) {
			filePath = filePath.replace(/\.css$/i, ".styl");
		}

		var fileStream = fs.createReadStream(filePath);
		fileStream.on('error', function (err) {
			console.log("arguments", arguments);
			if (err.message.indexOf("ENOENT, open '") === 0) {
				res.writeHead(404);
			} else {
				res.writeHead(500);
			}
			return res.end(err.message + "\n" + err.stack);
		});

		res.writeHead(200, {
			'Content-Type': mimeType,
			'Content-Encoding': 'gzip'
		});

		if (isCSS) {
			fileStream.on('data', function (chunk) {
				content+= chunk;
			});
			
			return fileStream.on('end', function () {
				stylus.render(content, function (err, cssContent) {
					if (err) { return handleError(err, res); }
					zlib.gzip(cssContent, function (err, zippedContent) {
						if (err) { return handleError(err, res); }
						res.end(zippedContent);
					});
				});
			});
		}
		
		return fileStream.pipe(zlib.createGzip()).pipe(res);

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