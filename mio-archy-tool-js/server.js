'use strict';

var models = require("./lib/mioarchy/MioarchyModels.js");

var http = require("http"),
    url = require("url"),
    path = require("path"),
    port = process.argv[2] || 8081,
    mio = require("./lib/mioarchy/MioarchyReader.js");

var dbReady = false;
var lastUpdated;

var sheetID ='1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ';

mio.readDatabase(sheetID, function(err) {
  dbReady = true;
  lastUpdated = new Date();
});

var intervalID = setInterval( function() {
  mio.checkForDatabaseChanges( sheetID, function(changed) {
    console.log(changed);

    if (changed) {
      mio.readDatabase(sheetID, function(err) {
        dbReady = true;
        lastUpdated = new Date();
      });
    }
  })}, 5000);

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

app.get('/orgAccountabilities', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.orgAccountabilities ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.get('/jobAccountabilities', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if(dbReady)

    res.send(JSON.stringify( mio.mioarchy.jobAccountabilities ));
  else {
    res.send(JSON.stringify({}));
  }
});

app.get('/lastUpdated', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify( lastUpdated ));
});

app.listen(port);

console.log('Listening on port ' + port + '...');