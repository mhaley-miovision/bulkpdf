'use strict';

var models = require("./lib/mioarchy/MioarchyModels.js");

var http = require("http"),
    url = require("url"),
    path = require("path"),
    express = require('express'),
    port = process.argv[2] || 8081,
    mio = require("./lib/mioarchy/MioarchyReader.js"),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var dbReady = false;
var lastUpdated;

var sheetId ='1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ'; // current, production

mio.readDatabase(sheetId, function(err) {
  dbReady = true;
  lastUpdated = new Date();
});

var intervalID = setInterval( function() {
  mio.checkForDatabaseChanges( sheetId, function(changed) {
    console.log("Detected changes: " + changed);

    if (changed) {
      mio.readDatabase(sheetId, function(err) {
        dbReady = true;
        lastUpdated = new Date();
      });
    }
  })}, 5000);



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

app.post('/updateSourceSheet', function(req, res) {
  if (req.body.sheetId) {
      sheetId = req.body.sheetId;
        mio.readDatabase(req.body.sheetId, function(err) {
        dbReady = true;
        lastUpdated = new Date();
      });
  }
  res.send(JSON.stringify({}));
});

app.listen(port);

console.log('Listening on port ' + port + '...');
