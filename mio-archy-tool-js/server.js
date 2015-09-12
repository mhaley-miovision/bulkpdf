'use strict';

var models = require("./lib/MioarchyModels.js");

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8082,
    mio = require("./lib/MioarchyReader.js");

var dbReady = false;

mio.readDatabase('1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ', function(err) {
  dbReady = true;
});

var express = require('express');
var app = express();

app.get('/editor/*', function(req, res){
  var uid = req.params.uid,
    path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile(path, {root: '.'});
});

/* ====================================================================================
    Object endpoints
*/

app.get('/jobs', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.jobs ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.get('/applications', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.applications ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.get('/roles', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.roles ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.get('/organizations', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.organizations ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.get('/contributors', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.contributors ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.listen(port);

console.log('Listening on port ' + port + '...');