/*
var fs = Npm.require('fs');
var Future = Npm.require('fibers/future');
var googleAuth = Meteor.npmRequire('google-auth-library');
var readline = Meteor.npmRequire('readline');
var google = Meteor.npmRequire('googleapis');
var SCOPES = ['https://www.googleapis.com/auth/admin.directory.user.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
	process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'token.json';
*/

/*
 var tokenVerified = false;

Meteor.startup(function() {
	initCronJob();
})

function recurringCronJob() {
	if (tokenVerified) {

	}
}

function initCronJob() {
	SyncedCron.add({
		name: 'GoogleUserPhotoSync',
		schedule: function(parser) {
			// parser is a later.parse object
			return parser.text('every 1 hour');
		},
		job: recurringCronJob
	});
}

Meteor.methods("teal.users.getGoogleUsers", function() {
	var content = Assets.getText('clientSecret.json');
	authorize(JSON.parse(content));
});

function testAuthorization() {
	var content = Assets.getText('clientSecret.json');
	authorize(JSON.parse(content), listUsers);
}

function authorize(credentials, callback) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			console.error("Failed to find token at: " + TOKEN_PATH);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client);
		}
	});
}

function listUsers(auth) {
	var service = google.admin('directory_v1');
	service.users.list({
		auth: auth,
		customer: 'my_customer',
		maxResults: 500,
		orderBy: 'email'
	}, function(err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		var users = response.users;
		if (users.length == 0) {
			console.log('No users in the domain.');
		} else {
			console.log('Users:');
			for (var i = 0; i < users.length; i++) {
				var user = users[i];
				console.log(user);
			}
		}
	});
}
*/