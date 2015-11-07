'use strict';

function MioarchyClient() {
	this.init();
}

MioarchyClient.prototype =
{
	init: function () {
		this.isReady = false;
		this.isError = false;
		this.mioarchy = {};
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
			self.getJSON("/jobs"), self.getJSON("/organizations"), self.getJSON("/contributors"),
			self.getJSON("/applications"), self.getJSON("/roles"), self.getJSON("/orgAccountabilities"),
			self.getJSON("/jobAccountabilities")
		]).then( function(results) {
			console.log("All promised resolved!");

			// create the mioarchy object
			self.mioarchyCachedModel = new Mioarchy(results[0], results[1], results[2],
				results[3], results[4], results[5], results[6]);
			self.applyActiveTransformation();
			self.notifyComplete();
		}, function() {
			self.isError = true;
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
