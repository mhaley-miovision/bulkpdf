'use strict';

var GoogleSpreadsheet = require("google-spreadsheet");
var _ = require("underscore");
var Models = require("./models.js");

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
            var row = rows[r];
            var id = row['id'];
            var name = row['application'];
            var parentOrg = row['organization']; 

            exports.applications[name] = new Models.Application(id, name, parentOrg);
        }
        console.log("read " + rows.length + " applications.");
        //console.log(_.keys(exports.applications));
    });
}
function processContributors(contribsSrc)
{
    contribsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var name = row['name'];
            var firstName = row['firstname']; 
            var lastName = row['lastname']; 

            exports.contributors[name] = new Models.Contributor(id, name, firstName, lastName);
        }
        console.log("read " + rows.length + " contributors.");
        //console.log(_.keys(exports.contributors));
    });
}
function processRoles(rolesSrc)
{
    rolesSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var name = row['name'];

            exports.roles[name] = new Models.Role(id, name);
        }
        console.log("read " + rows.length + " roles.");
        //console.log(_.keys(exports.roles));
    });
}
function processOrganizations(orgsSrc)
{
    orgsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var name = row['organization'];
            var parent = row['parent'];

            exports.organizations[name] = new Models.Organization(id, name, parent);
        }
        console.log("read " + rows.length + " organizations.");
        //console.log(_.keys(exports.organizations));
    });
}
function processJobs(jobsSrc)
{
    jobsSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var organization = row['organization'];
            var application = row['application'];
            var role = row['role'];
            var accountabilityLabel = row['accountabilitylabel'];
            var accountabilityLevel = row['accountabilitylevel'];
            var contributor = row['contributor'];
            var primaryAccountability = row['primaryaccountability'];

            exports.jobs[id] = new Models.Contributor(id, organization, application, role, accountabilityLabel, accountabilityLevel, contributor, primaryAccountability); 
        }
        console.log("read " + rows.length + " jobs.");
        console.log(exports.jobs);
    });
}