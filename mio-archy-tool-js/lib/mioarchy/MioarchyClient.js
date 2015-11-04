'use strict';

function MioarchyClient() {
	this.init();
}

MioarchyClient.prototype =
{
	init: function () {
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
	notifyComplete: function () {
		this.isReady = true;
		console.log("Mioarchy: All DB data loaded on the front-end, initiating callback.");
		this.readyStateCallback();
	},
	readDB: function (readyStateCallback) {
		var self = this;

		self.init(); // clear tables

		self.readyStateCallback = readyStateCallback;

		Promise.all([
			self.getJSON("/applications").then( function(value) { self.applications = value; }),
			self.getJSON("/organizations").then ( function(value) { self.organizations = value; }),
			self.getJSON("/contributors").then( function(value) { self.contributors = value; }),
			self.getJSON("/roles").then( function (value) { self.roles = value; }),
			self.getJSON("/jobs").then( function (value) { self.jobs = value; }),
			self.getJSON("/orgAccountabilities").then( function (value) { self.orgAccountabilities = value; }),
			self.getJSON("/jobAccountabilities").then( function (value) { self.jobAccountabilities = value; })
		]).then( function() {
			console.log("All promised resolved!");

			// create the mioarchy object
			self.mioarchy = new Mioarchy(self.jobs, self.organizations, self.contributors, self.applications, self.roles,
				self.orgAccountabilities, self.jobAccountabilities);

			self.notifyComplete();
		}, function() {
			this.isError = true;
		});
	},
	getLastUpdated: function (updateCheckCallback) {
		this.getJSON("/lastUpdated", updateCheckCallback, this.notifyError);
	},
	updateSourceSheet: function (sheetId, updateSourceSheetCallback) {
		this.postJson("/updateSourceSheet", { sheetId: sheetId }, updateSourceSheetCallback, this.notifyError);
	},
	getUserPhotoUrl: function (email, callback) {
		this.getJSON("/userPhotoUrl/" + encodeURIComponent(email), callback, this.notifyError);
	},
	getJSON: function (url, successHandler, errorHandler) {
		self = this;
		return new Promise( function(resolve, reject) {

			var xhr = typeof XMLHttpRequest != 'undefined'
				? new XMLHttpRequest()
				: new ActiveXObject('Microsoft.XMLHTTP');

			xhr.open('get', url, true);
			xhr.onreadystatechange = function () {
				var status;
				var data;
				// https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
				if (xhr.readyState == 4) { // `DONE`
					status = xhr.status;
					if (status == 200) {
						data = JSON.parse(xhr.responseText);
						successHandler && successHandler.call(self, data);
						resolve(data);
					} else {
						errorHandler && errorHandler.call(self, status);
						reject(status);
					}
				}
			};
			xhr.send();
		});
	},

	postJson: function (url, body, successHandler, errorHandler) {
		var self = this;

		return new Promise( function(resolve, reject) {

			var xhr = typeof XMLHttpRequest != 'undefined'
				? new XMLHttpRequest()
				: new ActiveXObject('Microsoft.XMLHTTP');

			xhr.open("POST", url, true);

			//Send the proper header information along with the request
			xhr.setRequestHeader("content-type", "application/json");

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) { // `DONE`
					var status;
					var data;
					status = xhr.status;
					if (status == 200) {
						data = JSON.parse(xhr.responseText);
						successHandler && successHandler.call(self, data);
						resolve(data);
					} else {
						errorHandler && errorHandler.call(self, status);
						reject(status);
					}
				}
			}
			var json = JSON.stringify(body);
			xhr.send(json);
		});
	}
}
