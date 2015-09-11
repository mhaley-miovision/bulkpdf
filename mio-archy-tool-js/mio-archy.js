'use strict';

var GoogleSpreadsheet = require("google-spreadsheet");
var _ = require("underscore");

exports.applications = [];
exports.contributors = [];
exports.organizations = [];
exports.roles = [];
exports.jobs = [];

exports.readDatabase = function (sourceSheet) {

    // spreadsheet key is the long id in the sheets URL 
    var db = new GoogleSpreadsheet(sourceSheet);
     
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
};

var knownTables = [ "Applications", "Contributors", "Roles", "Organizations", "Jobs" ];

// BRITTLENESS WARNING: for now, assume the columns are in the same place as the gdoc
// also ignores first row

function processApplications(appsSrc)
{
    appsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            exports.applications[rows[r]['application']] = rows[r];
        }
        console.log("read " + rows.length + " applications.");
        console.log(_.keys(exports.applications));
    });
}
function processContributors(contribsSrc)
{
    contribsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            exports.contributors[rows[r]['name']] = rows[r];
        }
        console.log("read " + rows.length + " contributors.");
        console.log(_.keys(exports.contributors));
    });
}
function processRoles(rolesSrc)
{
    rolesSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            exports.roles[rows[r]['role']] = rows[r];
        }
        console.log("read " + rows.length + " roles.");
        console.log(_.keys(exports.roles));
    });
}
function processOrganizations(orgsSrc)
{
    orgsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            exports.organizations[rows[r]['organization']] = rows[r];
        }
        console.log("read " + rows.length + " organizations.");
        console.log(_.keys(exports.organizations));
    });
}
function processJobs(jobsSrc)
{
    jobsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            exports.jobs[rows[r]['accountability label']] = rows[r];
        }
        console.log("read " + rows.length + " jobs.");
        console.log(_.keys(exports.jobs));
    });
}