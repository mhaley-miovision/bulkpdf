// retrieval completion flags
var APPS_DONE = 1;
var CONT_DONE = 2;
var ORGS_DONE = 4;
var ROLE_DONE = 8;
var JOBS_DONE = 16;
var ALL_DONE = APPS_DONE | CONT_DONE | ORGS_DONE | ROLE_DONE | JOBS_DONE;

function MioarchyClient(readyStateCallback) {
	this.isReady = false;
	this.isError = false;
	this.doneFlags = 0;
	this.mioarchy = {};
	this.applications = {};
	this.organizations = {};
	this.contributors = {};
	this.roles = {};
	this.jobs = {};
	this.readyStateCallback = readyStateCallback;
}

MioarchyClient.prototype = 
{
	notifySuccess: function(flag) {
		this.doneFlags |= flag;	
		if (this.doneFlags == ALL_DONE) {
			// create the mioarchy object
			this.mioarchy = new Mioarchy( this.jobs, this.organizations, this.contributors, this.apps, this.roles );
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
		this.applications = apps;
		this.notifySuccess(APPS_DONE);
	},
	notifySuccessOrgs: function(orgs) {
		this.organizations = orgs;
		this.notifySuccess(ORGS_DONE);
	},
	notifySuccessContribs: function(contribs) {
		this.contributors = contribs;
		this.notifySuccess(CONT_DONE);
	},
	notifySuccessRoles: function(roles) {
		this.roles = roles;
		this.notifySuccess(ROLE_DONE);
	},
	notifySuccessJobs: function(jobs) {
		this.jobs = jobs;
		this.notifySuccess(JOBS_DONE);
	},
	readDB: function() {
		this.getJSON("/applications", this.notifySuccessApps, this.notifyError);
		this.getJSON("/organizations", this.notifySuccessOrgs, this.notifyError);
		this.getJSON("/contributors", this.notifySuccessContribs, this.notifyError);
		this.getJSON("/roles", this.notifySuccessRoles, this.notifyError);
		this.getJSON("/jobs", this.notifySuccessJobs, this.notifyError);
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
