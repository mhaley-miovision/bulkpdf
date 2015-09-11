'use strict';

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8081,
    GoogleSpreadsheet = require("google-spreadsheet"),
    _ = require("underscore");


// spreadsheet key is the long id in the sheets URL 
var db = new GoogleSpreadsheet('1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ');
 
// Without auth -- read only 
// IMPORTANT: See note below on how to make a sheet public-readable! 
// # is worksheet id - IDs start at 1 
console.log("Reading Google Doc DB...");
console.time("read_db");

db.getInfo( function (err, sheetInfo) {
    console.log(err);


    console.log( sheetInfo.title + ' is loaded' );
    // use worksheet object if you want to stop using the # in your calls 

    for (var i = 0; i < sheetInfo.worksheets.length; i++) {
        var s = sheetInfo.worksheets[i];

        if (knownTables.indexOf(s.title) >= 0) {
            eval("process" + s.title + "(s);");
        }
    }
});

var knownTables = [ "Applications", "Contributors", "Roles", "Organizations", "Jobs" ];

var applications = [];
var contributors = [];
var organizations = [];
var roles = [];
var jobs = [];

// BRITTLENESS WARNING: for now, assume the columns are in the same place as the gdoc
// also ignores first row

function processApplications(appsSrc)
{
    appsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            applications[rows[r]['application']] = rows[r];
        }
        console.log("read " + rows.length + " applications.");
    });
}
function processContributors(contribsSrc)
{
    contribsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            contributors[rows[r]['name']] = rows[r];
        }
        console.log("read " + rows.length + " contributors.");
    });
}
function processRoles(rolesSrc)
{
    rolesSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            roles[rows[r]['role']] = rows[r];
        }
        console.log("read " + rows.length + " roles.");
        console.log(_.keys(roles));
    });
}
function processOrganizations(orgsSrc)
{
    orgsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            organizations[rows[r]['organization']] = rows[r];
        }
        console.log("read " + rows.length + " organizations.");
    });
}
function processJobs(jobsSrc)
{
    orgsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            organizations[rows[r]['accountability label']] = rows[r];
        }
        console.log("read " + rows.length + " jobs.");
    });
}



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