var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/admin.directory.user.readonly'];
var TOKEN_DIR = "./";
var TOKEN_PATH = TOKEN_DIR + 'googleAdmin.json';


var key = require('~/keys/TealApp.json');
var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, 
	['https://www.googleapis.com/auth/admin.directory.user.readonly'], null);
 
jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  }
 
  // Make an authorized request to list Drive files. 
  drive.files.list({ auth: jwtClient }, function(err, resp) {
    // handle err and response 
  });
});


var CLIENT_ID = env.googleapis.client_id;
var CLIENT_SECRET = env.googleapis.client_secret;
var oauth2 = new googleapis.OAuth2Client(CLIENT_ID, CLIENT_SECRET, 'postmessage');

var SERVICE_ACCOUNT_EMAIL = 'teal@miovision.com';
var SERVICE_ACCOUNT_KEY_FILE = '~/keys/TealApp.json';
var jwt = new googleapis.auth.JWT(
        SERVICE_ACCOUNT_EMAIL,
        SERVICE_ACCOUNT_KEY_FILE,
        null,
        ['https://www.googleapis.com/auth/admin.directory.user.readonly']);

(function(){
	"use strict";

	// Load client secrets from a local file.
	fs.readFile('~/keys/TealApp.json', function processClientSecrets(err, content) {
		if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	}

})

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listUsers(auth) {
	var gmail = google.gmail('v1');
	gmail.users.labels.list({
		auth: auth,
		userId: 'me',
	}, function(err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		var labels = response.labels;
		if (labels.length == 0) {
			console.log('No labels found.');
		} else {
			console.log('Labels:');
			for (var i = 0; i < labels.length; i++) {
				var label = labels[i];
				console.log('- %s', label.name);
			}
		}
	});
}