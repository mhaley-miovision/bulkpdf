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
	this.applications = {};
	this.organizations = {};
	this.contributors = {};
	this.roles = {};
	this.jobs = {};
	this.readyStateCallback = readyStateCallback;
}

MioarchyClient.prototype = {
	notifySuccess: function(flag) {
		this.doneFlags |= flag;	
		if (this.doneFlags == ALL_DONE) {
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
		this.getJSON("/applications", MioarchyClient.prototype.notifySuccessApps, MioarchyClient.prototype.notifyError);
		this.getJSON("/organizations", MioarchyClient.prototype.notifySuccessOrgs, MioarchyClient.prototype.notifyError);
		this.getJSON("/contributors", MioarchyClient.prototype.notifySuccessContribs, MioarchyClient.prototype.notifyError);
		this.getJSON("/roles", MioarchyClient.prototype.notifySuccessRoles, MioarchyClient.prototype.notifyError);
		this.getJSON("/jobs", MioarchyClient.prototype.notifySuccessJobs, MioarchyClient.prototype.notifyError);
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

