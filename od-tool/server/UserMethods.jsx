if (Meteor.isServer) {
	Meteor.methods({
		// TODO: this needs to be publication
		"teal.users.getMyOrganization": function() {
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
		},

		// TODO: this needs to be publication
		"teal.users.getMyEmail": function() {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			console.log(Meteor.user().services.google.email);

			return Meteor.user().services.google.email;
		},

		"teal.import.importUserPhotoInfo": function() {
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			Meteor.call("teal.users.updateGoogleAdminCache");

			// now we have populated a user cache we can pull data from
			var notFoundString = "";
			var noPhotoString = "";
			var updatedString = "";
			var updatedCount = 0;
			var notFoundCount = 0;

			console.log("About to update the OD model with photo info...");

			Meteor.call("teal.users.updateGoogleAdminCache");

			GoogleUserCacheCollection.find({}).forEach(o => {

				// update the corresponding contributor
				let c = ContributorsCollection.findOne({email: o.primaryEmail});
				if (!c) {
					notFoundString += o.primaryEmail + "\n";
					notFoundCount++;
				} else if (o.thumbnailPhotoUrl) {
					// attach to this contributor
					ContributorsCollection.update(c._id, {$set: {photo: o.thumbnailPhotoUrl}});

					// also attach photo to all roles tied to this user
					RolesCollection.update({email: c.email}, {$set: {photo: o.thumbnailPhotoUrl}}, {multi: true});

					// also attach photo to all roles cached to goals
					GoalsCollection.find(
						{
							$or: [{ownerRoles: {$elemMatch: {email: c.email}}},
								{contributorRoles: {$elemMatch: {email: c.email}}}
							]
						}).forEach(g => {

						g.ownerRoles.forEach(r => {
							if (r.email === c.email) {
								r.photo = o.thumbnailPhotoUrl;
							}
						});
						g.contributorRoles.forEach(r => {
							if (r.email === c.email) {
								r.photo = o.thumbnailPhotoUrl;
							}
						});
						GoalsCollection.update(g._id, g);
					});

					updatedString += o.primaryEmail + "\n";
					updatedCount++;
				} else {
					noPhotoString += o.primaryEmail + "\n";
				}
			});

			var email = "Updated " + updatedCount + " photo urls.\n\n\nUpdated:" + updatedString
				+ "\n\n\nUnknown contributors:\n\n" + notFoundString
				+ "\n\nContributors without a photo:\n\n" + noPhotoString;
			console.log(email);
			Email.send({
				from: "teal@miovision.com",
				to: "vleipnik@miovision.com",
				subject: "User photos imported, " + notFoundCount + " unknown",
				text: email
			});

			return true;
		},

		// TODO: this needs to be publication
		"teal.users.getPhotoUrlByUserName": function(userName) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var c = ContributorsCollection.findOne({name: userName});
			if (c && c.photo) {
				return c.photo;
			} else {
				return "/img/user_avatar_blank.jpg";
			}
		},
	});
}

Meteor.publish("teal.user", function() {
	if (Meteor.userId) {
		let user = Meteor.users.findOne(Meteor.userId);
		return user;
	} else {
		return {  };
	}
})

Meteor.startup(function() {
	Meteor.users._ensureIndex( {"email": 1 }, { unique: true } );

	// useful when doing a full DB drop
	let u = Meteor.users.findOne({email:"vleipnik@miovision.com"});
	if (u) {
		if (!u.roles) {
			Meteor.users.update(u._id, {$set:{roles:['enabled','admin']}});
		}
	}
	// useful when doing a full DB drop
	u = Meteor.users.findOne({email:"leipnik@gmail.com"});
	if (u) {
		if (!u.roles) {
			Meteor.users.update(u._id, {$set:{roles:['enabled']}});
		}
	}
});
