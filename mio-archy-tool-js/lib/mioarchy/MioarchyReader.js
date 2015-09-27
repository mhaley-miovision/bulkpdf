'use strict';

var GoogleSpreadsheet = require("google-spreadsheet");
var _ = require("underscore");
var Models = require("./MioarchyModels.js");

var applications = {};
var contributors = {};
var organizations = {};
var roles = {};
var jobs = {};
var orgAccountabilities = {};
var jobAccountabilities = {};

var knownTables = [ "Applications", "Contributors", "Roles", "Organizations", "Jobs", "JobAccountabilities", "OrganizationAccountabilities" ];

// this will be the resulting object
exports.mioarchy = {};

// retrieval completion flags
var APPS_DONE = 1;
var CONT_DONE = 2;
var ORGS_DONE = 4;
var ROLE_DONE = 8;
var JOBS_DONE = 16;
var ORG_ACCOUNTABILITIES_DONE = 32;
var JOB_ACCOUNTABILITIES_DONE = 64;
var _doneFlags = 0;
var _allDone = APPS_DONE | CONT_DONE | ORGS_DONE | ROLE_DONE | JOBS_DONE |
    ORG_ACCOUNTABILITIES_DONE | JOB_ACCOUNTABILITIES_DONE;
var _doneCallback;
var _lastUpdated;

exports.readDatabase = function (sourceSheet, onCompleteCallback) {
    // spreadsheet key is the long id in the sheets URL
    var db = new GoogleSpreadsheet(sourceSheet);

    // clear tables! (useful for if calling this function again)
    applications = {};
    contributors = {};
    organizations = {};
    roles = {};
    jobs = {};
    orgAccountabilities = {};
    jobAccountabilities = {};
     
    // Without auth -- read only 
    // IMPORTANT: See note below on how to make a sheet public-readable! 
    // # is worksheet id - IDs start at 1 
    console.log("Reading Google Doc DB...");
    console.time("read_db");

    // clear done flags
    _doneFlags = 0;
    _doneCallback = onCompleteCallback;

    db.getInfo( function (err, sheetInfo) {
        console.log( sheetInfo.title + ' is loaded' );

        for (var i = 0; i < sheetInfo.worksheets.length; i++) {
            var s = sheetInfo.worksheets[i];
            var titleNoSpaces = s.title.replace(/\s+/g, '');

            if (knownTables.indexOf( titleNoSpaces ) >= 0) {
                eval("process" + titleNoSpaces + "(s);");
            }
        }
    });
};

function notifyDone() {
    if (_doneFlags == _allDone) {

        exports.mioarchy = new Models.Mioarchy( jobs, organizations, contributors, applications, roles,
            orgAccountabilities, jobAccountabilities );

        console.log("All data read from DB.");
        console.timeEnd("read_db");

        _lastUpdated = new Date(); // save the last updated time

        _doneCallback();
    }
}

// BRITTLENESS WARNING: for now, assume the columns are in the same place as the gdoc
// also ignores first row

function processApplications(appsSrc)
{
    appsSrc.getRows(0, function( err, rows) 
    {
        for (var r = 0; r < rows.length; r++) 
        {
            var row = rows[r];
            var id = row['id'];
            var name = row['application'];
            var parentOrg = row['organization'];
            var color = row['color'];

            applications[name] = new Models.Application( id, name, parentOrg, color );
        }
        console.log("read " + rows.length + " applications.");
        //console.log(_.keys(exports.applications));
        _doneFlags |= APPS_DONE;
        notifyDone();
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

            contributors[name] = new Models.Contributor(id, name, firstName, lastName);
        }
        console.log("read " + rows.length + " contributors.");
        //console.log(_.keys(exports.contributors));
        _doneFlags |= CONT_DONE;
        notifyDone();
    });
}
function processRoles(rolesSrc)
{
    rolesSrc.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var name = row['role'];

            roles[name] = new Models.Role(id, name);
        }
        console.log("read " + rows.length + " roles.");
        //console.log(_.keys(roles));
        _doneFlags |= ROLE_DONE;
        notifyDone();
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
            var isApplication = row['isapplication'];
            if (isApplication) {
                isApplication = isApplication.toLowerCase() == 'true';
            }

            organizations[name] = new Models.Organization(id, name, parent, isApplication);
        }
        console.log("read " + rows.length + " organizations.");
        //console.log(_.keys(exports.organizations));
        _doneFlags |= ORGS_DONE;
        notifyDone();
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
            var active = row['active'];

            if (active && active.toLowerCase() == "true") {
                jobs[id] = new Models.Job(id, organization, application, role, accountabilityLabel, accountabilityLevel, contributor, primaryAccountability);
            }
        }
        console.log("read " + rows.length + " jobs.");
        //console.log(exports.jobs);
        _doneFlags |= JOBS_DONE;
        notifyDone();
    });
}
function processJobAccountabilities(src)
{
    src.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var appId = row['appid'];
            var job = row['job'];
            var jobId = row['jobid'];
            var label = row['accountability'];
            var app = row['application'];
            var rating = row['rating'];
            var type = row['type'];
            var organization = row['organization'];

            if (typeof(jobAccountabilities[jobId]) == 'undefined') {
                jobAccountabilities[jobId] = [];
            }
            jobAccountabilities[jobId].push(new Models.Accountability(id, appId, app, label, rating, type, organization));
        }
        console.log("read " + rows.length + " job accountabilities.");
        _doneFlags |= JOB_ACCOUNTABILITIES_DONE;
        notifyDone();
    });
}
function processOrganizationAccountabilities(src)
{
    src.getRows( 0, function( err, rows) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var id = row['id'];
            var orgId = row['orgid'];
            var appId = row['applicationid'];
            var org = row['organization'];
            var app = row['application'];
            var label = row['accountability'];
            var rating = row['rating'];
            var type = row['type'];

            if (typeof(orgAccountabilities[org]) == 'undefined') {
                orgAccountabilities[org] = [];
            }
            orgAccountabilities[org].push(new Models.Accountability( id, appId, app, label, rating, type ));
        }
        console.log("read " + rows.length + " org accountabilities.");
        _doneFlags |= ORG_ACCOUNTABILITIES_DONE;
        notifyDone();
    });
}

//----------------------------------------------------------------------------------------------------------------------
// Monitoring functionality
//
exports.checkForDatabaseChanges = function (sourceSheet, onChangedCallback) {
    // spreadsheet key is the long id in the sheets URL
    var db = new GoogleSpreadsheet(sourceSheet);

    db.getInfo( function( err, sheetInfo ){
        if (err) {
            console.log("Error trying to read DB: ");
            console.log(err);
        } else {
            console.log(sheetInfo.title + ' is loaded');
            // use worksheet object if you want to stop using the # in your calls
            var updated = new Date(sheetInfo.updated);

            // notify of change state
            onChangedCallback( updated.getTime() > _lastUpdated.getTime());
        }
    });
}