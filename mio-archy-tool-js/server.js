'use strict';

var models = require("./lib/models.js");

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8082,
    mio = require("./lib/mioarchy.js");

var dbReady = false;

mio.readDatabase('1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ', function(err) {
  dbReady = true;
});

var express = require('express');
var app = express();

//app.use(express.static('client'));

app.get('/editor/*', function(req, res){
  var uid = req.params.uid,
    path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile(path, {root: '.'});
});

app.get('/', function(req, res){
  res.setHeader('Content-Type', 'application/json');

  //if(dbReady)

  res.send(JSON.stringify( mio.jobs ));
});

app.listen(port);

console.log('Listening on port ' + port + '...');

/*
http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

*/
