'use strict';

// retrieval completion flags
var APPS_DONE = 1;
var CONT_DONE = 2;
var ORGS_DONE = 4;
var ROLE_DONE = 8;
var JOBS_DONE = 16;
var ORG_ACCOUNTABILITIES_DONE = 32;
var JOB_ACCOUNTABILITIES_DONE = 64;
var ALL_DONE = APPS_DONE | CONT_DONE | ORGS_DONE | ROLE_DONE | JOBS_DONE |
	ORG_ACCOUNTABILITIES_DONE | JOB_ACCOUNTABILITIES_DONE;

function MioarchyClient() {
	this.init();
}

MioarchyClient.prototype = 
{
	init: function() {
		this.isReady = false;
		this.isError = false;
		this.doneFlags = 0;
		this.mioarchy = {};
		this.applications = {};
		this.organizations = {};
		this.contributors = {};
		this.roles = {};
		this.jobs = {};
		this.orgAccountabilities = {};
		this.jobAccountabilities = {};
	},
	notifySuccess: function(flag) {
		this.doneFlags |= flag;	
		if (this.doneFlags == ALL_DONE) {
			// create the mioarchy object
			this.mioarchy = new Mioarchy( this.jobs, this.organizations, this.contributors, this.apps, this.roles,
				this.orgAccountabilities, this.jobAccountabilities );
			this.notifyComplete();
		}
	},
	notifyComplete: function() {
		this.isReady = true;
		console.log("Mioarchy: All DB data loaded on the front-end, initiating callback.");
		this.readyStateCallback();
	},
	notifyErrors: function(err) {
		this.isError = true;
	},
	notifySuccessApps: function(apps) {
		for (var a in apps) {
			var app = apps[a];
			this.applications[app.name] = app;
		}
		this.notifySuccess(APPS_DONE);
	},
	notifySuccessOrgs: function(orgs) {
		for (var o in orgs) {
			var org = orgs[o];
			this.organizations[org.name] = org;
		}
		this.notifySuccess(ORGS_DONE);
	},
	notifySuccessContribs: function(contribs) {
		for (var c in contribs) {
			var contrib = contribs[c];
			this.contributors[contrib.name] = contrib;
		}
		this.notifySuccess(CONT_DONE);
	},
	notifySuccessRoles: function(roles) {
		for (var r in roles) {
			var role = roles[r];
			this.roles[role.name] = role;
		}
		this.notifySuccess(ROLE_DONE);
	},
	notifySuccessJobs: function(jobs) {
		for (var j in jobs) {
			var job = jobs[j];
			this.jobs[job.id] = job;
		}
		this.notifySuccess(JOBS_DONE);
	},
	notifySuccessOrgAccountabilities: function(accountabilities) {
		for (var org in accountabilities) {
			var acc = accountabilities[org];
			this.orgAccountabilities[org] = acc;
		}
		this.notifySuccess(ORG_ACCOUNTABILITIES_DONE);
	},
	notifySuccessJobAccountabilities: function(accountabilities) {
		for (var job in accountabilities) {
			var acc = accountabilities[job];
			this.jobAccountabilities[job] = acc;
		}
		this.notifySuccess(JOB_ACCOUNTABILITIES_DONE);
	},
	readDB: function( readyStateCallback ) {
		this.init(); // clear tables

		this.readyStateCallback = readyStateCallback;

		this.getJSON("/applications", this.notifySuccessApps, this.notifyError);
		this.getJSON("/organizations", this.notifySuccessOrgs, this.notifyError);
		this.getJSON("/contributors", this.notifySuccessContribs, this.notifyError);
		this.getJSON("/roles", this.notifySuccessRoles, this.notifyError);
		this.getJSON("/jobs", this.notifySuccessJobs, this.notifyError);
		this.getJSON("/orgAccountabilities", this.notifySuccessOrgAccountabilities, this.notifyError);
		this.getJSON("/jobAccountabilities", this.notifySuccessJobAccountabilities, this.notifyError);
	},
	getLastUpdated: function(updateCheckCallback) {
		this.getJSON("/lastUpdated", updateCheckCallback, this.notifyError);
	},
	getJSON: function(url, successHandler, errorHandler) {
	  var xhr = typeof XMLHttpRequest != 'undefined'
	    ? new XMLHttpRequest()
	    : new ActiveXObject('Microsoft.XMLHTTP');

	  xhr.open('get', url, true);

	  var _this = this;
	  xhr.onreadystatechange = function() {
	    var status;
	    var data;
	    // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
	    if (xhr.readyState == 4) { // `DONE`
	      status = xhr.status;
	      if (status == 200) {
	        data = JSON.parse(xhr.responseText);

	        successHandler && successHandler.call(_this, data);
	      } else {
	        errorHandler && errorHandler.call(_this, status);
	      }
	    }
	  };
	  xhr.send();
	}
}
