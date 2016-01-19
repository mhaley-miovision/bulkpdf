Meteor.methods({
	getGoogleUsers() {
		const adminProfile = Meteor.users.findOne({
			'profile.name' : 'Victor Leipnik'
		});
		//console.log(adminProfile);
		//console.log (adminProfile.services.google.accessToken);

		var options = {
			customer: 'my_customer',
			maxResults: 500,
			orderBy: 'email',
			viewType: 'domain_public',
			user: adminProfile,
			//access_token: adminProfile.services.google.accessToken,
		};

		var accessToken = adminProfile.services.google.accessToken;

		return true;
	},

	getMyProfilePhoto() {
		const myUserProfile = Meteor.users.findOne({
			'_id' : this.userId,
		});
		//console.log(myUserProfile.services.google.picture);
		return myUserProfile.services.google.picture;
	}
});

// Only publish users if the client is an admin
Meteor.publish("users", function () {
	//return Meteor.users.find({});

	return Meteor.users.find({},
	{ 'fields': {
		'user': 1,
		'services.google.email': 1,
		'services.google.name': 1,
		'services.google.given_name': 1,
		'services.google.family_name': 1,
		'services.google.picture': 1,
		'services.google.gender': 1
	}});
});


// On server startup, if the database is empty, create some initial data.
Meteor.startup(function () {

	//console.log("server");
	Meteor.call("getGoogleUsers", function (err, resp) {
		//console.log(err);
		//console.log(resp);
	});
});

