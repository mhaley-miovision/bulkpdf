Meteor.methods({
	"teal.users.getGoogleUsers": function() {
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

	"teal.users.getMyProfilePhoto": function() {
		const myUserProfile = Meteor.users.findOne({
			'_id' : this.userId,
		});
		//console.log(myUserProfile.services.google.picture);
		return myUserProfile.services.google.picture;
	}
});
