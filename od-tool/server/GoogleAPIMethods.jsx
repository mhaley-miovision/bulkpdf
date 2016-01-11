Meteor.methods({
	getUsers() {
		const adminProfile = Meteor.users.findOne({
			'profile.name' : 'Victor Leipnik'
		});
		console.log(adminProfile);

		var options = {
			customer: 'my_customer',
			maxResults: 500,
			orderBy: 'email',
			viewType: 'domain_public'
		};

		//var response = HTTP.call("GET","https://www.googleapis.com/admin/directory/v1/users", options);

		//console.log(response.statusCode);
		return adminProfile.services.google.picture;
	},

	getMyProfilePhoto() {
		const myUserProfile = Meteor.users.findOne({
			'_id' : this.userId,
		});
		console.log(myUserProfile.services.google.picture);
		return myUserProfile.services.google.picture;
	}
});

// Only publish users if the client is an admin
Meteor.publish("users", function () {
	//return Meteor.users.find({});

	var d=  Meteor.users.find({},
		{ 'fields': {
			'user': 1,
			'services.google.email': 1,
			'services.google.name': 1,
			'services.google.given_name': 1,
			'services.google.family_name': 1,
			'services.google.picture': 1,
			'services.google.gender': 1
		}});
	console.log(d);
	return d;
});


// On server startup, if the database is empty, create some initial data.
Meteor.startup(function () {

	console.log("server");
	Meteor.call("getUsers", function (err, resp) {
		console.log(err);
		console.log(resp);
	});
});