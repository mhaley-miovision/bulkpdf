import { Meteor } from 'meteor/meteor'

export const GoogleUserCacheCollection = new Mongo.Collection("teal.googleUserCache");

if (Meteor.isServer) {

	var fs = Npm.require('fs');
	var Future = Npm.require('fibers/future');
	var googleAuth = Meteor.npmRequire('google-auth-library');
	var readline = Meteor.npmRequire('readline');
	var google = Meteor.npmRequire('googleapis');
	var SCOPES = ['https://www.googleapis.com/auth/admin.directory.user.readonly'];
	var doneLoadingCacheCallBack = null;

	var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
	try {
		// Query the entry
		stats = fs.lstatSync('/home/ubuntu');

		// Is it a directory?
		if (stats.isDirectory()) {
			var TOKEN_DIR = '/home/ubuntu/.credentials/';
		}
	}
	catch (e) {
		console.error(e);
	}
	var TOKEN_PATH = TOKEN_DIR + "token.json";

	var tokenVerified = false;

	// TODO [MAJOR]: this still relies on the script in /private to init the auth token

	// TODO: implement a recurring job to update this cache, or even better enable this domain to be able to receive push
	// notifications from Google
	/*
	 Meteor.startup(function() {
	 initCronJob();
	 })

	 function recurringCronJob() {
	 if (tokenVerified) {

	 }
	 }*/

	// TODO: this maxes out at 500 users; fix this if (when :) it becomes a bottle neck
	function updateGoogleAdminCache(auth) {
		var service = google.admin('directory_v1');
		var future = new Future();
		service.users.list({
			auth: auth,
			domain: 'miovision.com',
			customer: 'my_customer',
			maxResults: 500, // TODO: magic number
			orderBy: 'email'
		}, Meteor.bindEnvironment(function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err);
				future.throw(err);
			}
			var users = response.users;
			future.return({users:response.users});
		}));
		return future.wait();
	}

	function authorize(credentials) {
		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[0];
		var auth = new googleAuth();
		var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
		var future = new Future();

		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, Meteor.bindEnvironment(function(err, token) {
			if (err) {
				console.error("Failed to find token at: " + TOKEN_PATH);
				future.throw(err);
			} else {
				oauth2Client.credentials = JSON.parse(token);
				future.return({
					oauth2Client:oauth2Client
				});
				//callback(oauth2Client);
			}
		}));
		return future.wait();
	}

	Meteor.methods({
		"teal.users.updateGoogleAdminCache" : function() {
			var content = Assets.getText('clientSecret.json');
			console.log('About to authorize with Google...');
			var results = authorize(JSON.parse(content));
			console.log('About to retrieve users...');
			var users = updateGoogleAdminCache(results.oauth2Client).users;
			if (users.length == 0) {
				console.log('No users in the domain.');
			} else {
				console.log('Found ' + users.length + ' users on the domain.');

				GoogleUserCacheCollection.remove({});

				if (users.length === 500) {
					console.warn("Reached 500 user limit!!!");
				}
				for (var i = 0; i < users.length; i++) {
					var user = users[i];
					GoogleUserCacheCollection.insert(user);
				}
			}
		}
	});
}
