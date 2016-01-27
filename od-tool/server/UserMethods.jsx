if (Meteor.isServer) {
	Meteor.methods({
		getMyOrganization() {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var myUserName = Meteor.user().profile.name;
			var contributor = ContributorsCollection.findOne ({ name: myUserName });

			if (contributor) {

			} else {
				throw new Meteor.error (404, 'Could not find username: ' + myUserName);
			}

			return contributor.physicalTeam;
		}
	});

	Meteor.methods({
		getMyEmail() {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			console.log(Meteor.user().services.google.email);

			return Meteor.user().services.google.email;
		}
	});
}