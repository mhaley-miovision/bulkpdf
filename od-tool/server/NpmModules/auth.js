CredentialsCollection = new Mongo.Collection("creds");

var google = Meteor.npmRequire('googleapis');
var googleAuth = Meteor.npmRequire('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/admin.directory.user'];

// Load client secrets from a local file.
function loadDefaultCredentials() {
	var t = Assets.getText("clientSecret.json");
	var c = JSON.parse(t);
	return c;
}

