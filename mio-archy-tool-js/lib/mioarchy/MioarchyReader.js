'use strict';

var GoogleSpreadsheet = require("google-spreadsheet");
var Promise = require("es6-promise").Promise;
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

// last time data was retried from the database
var _lastUpdated = null;

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
    var _promises = [];

    var getDbInfo = new Promise( function (resolve, reject) {
        db.getInfo(function (err, sheetInfo) {
            try {
                console.log(sheetInfo.title + ' is loaded');
                for (var i = 0; i < sheetInfo.worksheets.length; i++) {
                    var s = sheetInfo.worksheets[i];
                    var titleNoSpaces = s.title.replace(/\s+/g, '');

                    if (knownTables.indexOf(titleNoSpaces) >= 0) {
                        var fn = eval("process" + titleNoSpaces);
                        var promise = fn(s);
                        _promises.push(promise);
                    }
                }
            } catch (e) {
                console.error(e);
                reject();
            }
            resolve();
        });
    });

    getDbInfo.then( function() {
        Promise.all(_promises).then( function (values) {
            exports.mioarchy = new Models.Mioarchy( jobs, organizations, contributors, applications, roles,
                orgAccountabilities, jobAccountabilities );

            console.log("All data read from DB.");
            console.timeEnd("read_db");

            _lastUpdated = new Date(); // save the last updated time

            onCompleteCallback();

        }, function(err) {
            console.error("Failed to retrieve from database:");
            console.error(err);
        });
    });
};

function processApplications(appsSrc) {
    return new Promise( function(resolve, reject) {
        appsSrc.getRows(0, function (err, rows) {
            if (err) {
                console.log(err);
                reject();
            }
            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                var id = row['id'];
                var name = row['application'];
                var parentOrg = row['organization'];
                var color = row['color'];

                applications[name] = new Models.Application(id, name, parentOrg, color);
            }
            console.log("read " + rows.length + " applications.");
            resolve();
        });
    });
}
function processContributors(contribsSrc) {
    return new Promise( function (resolve, reject) {
        contribsSrc.getRows(0, function (err, rows) {
            if (err) {
                console.log(e);
                reject();
            }
            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                var id = row['id'];
                var name = row['name'];
                var firstName = row['firstname'];
                var lastName = row['lastname'];

                contributors[name] = new Models.Contributor(id, name, firstName, lastName);
            }
            console.log("read " + rows.length + " contributors.");
            resolve();
        });
    });
}
function processRoles(rolesSrc) {
    return new Promise( function (resolve, reject) {
        rolesSrc.getRows(0, function (err, rows) {
            if (err) {
                console.log(err);
                reject(false);
            }
            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                var id = row['id'];
                var name = row['role'];

                roles[name] = new Models.Role(id, name);
            }
            console.log("read " + rows.length + " roles.");
            resolve();
        });
    });
}
function processOrganizations(orgsSrc) {
    return new Promise( function (resolve, reject) {
        orgsSrc.getRows(0, function (err, rows) {
            if (err) {
                console.log(err);
                reject();
            }
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
            resolve();
        });
    });
}
function processJobs(jobsSrc) {
    return new Promise( function (resolve, reject) {
        jobsSrc.getRows(0, function (err, rows) {
            if (err) {
                console.log(e);
                reject();
            }
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
            resolve();
        });
    });
}
function processJobAccountabilities(src) {
    return new Promise( function (resolve, reject) {
        src.getRows(0, function (err, rows) {
            if (err) {
                console.log(e);
                reject();
            }
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
            resolve();
        });
    });
}
function processOrganizationAccountabilities(src) {
    return new Promise( function (resolve, reject) {
        src.getRows(0, function (err, rows) {
            if (err) {
                console.log(e);
                reject();
            }
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
                orgAccountabilities[org].push(new Models.Accountability(id, appId, app, label, rating, type));
            }
            console.log("read " + rows.length + " org accountabilities.");
            resolve();
        });
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
            console.error("Error trying to read DB: ");
            console.error(err);
        } else {
            if (sheetInfo.updated == null) {
                console.error("sheetInfo.updated == null, skipping update!");
                return;
            }

            console.log(sheetInfo.title + ' is loaded');
            // use worksheet object if you want to stop using the # in your calls
            var updated = new Date(sheetInfo.updated);

            if (updated && _lastUpdated) {
                // notify of change state
                onChangedCallback(updated.getTime() > _lastUpdated.getTime());
            } else {
                console.error("updated == null, skipping update!");
            }
        }
    });
}