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
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var myjson = JSON.parse(Assets.getText("users.json"));

			// update contributors photos
			var notFoundString = "";
			var noPhotoString = "";
			var updatedCount = 0;
			var notFoundCount = 0;
			for (var x in myjson) {
				var o = myjson[x];
				var c = ContributorsCollection.findOne({email: x});
				if (c && o.photo) {
					c.photo = o.photo;
					ContributorsCollection.update(c._id, c);
					updatedCount++;
				} else {
					if (c) {
						noPhotoString += x + ", " + o.name + (o.photo ? o.photo : "") + "\n";
						notFoundCount++;
					} else {
						notFoundString += x + ", " + o.name + (o.photo ? o.photo : "") + "\n";
					}
				}
			}

			var email = "Updated " + updatedCount + " photo urls.\n\n\nUnknown contributors:\n\n" + notFoundString
				+ "Contributors without a photo:\n\n" + noPhotoString;
			Email.send({
				from:"teal@miovision.com",
				to:"vleipnik@miovision.com",
				subject:"User photos imported, " + notFoundCount + " unknown",
				text:email
			})

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

		// TODO: this needs to be publication
		"teal.users.getPhotoUrlByUserEmail": function(email) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var c = ContributorsCollection.findOne({email: email});

			console.log(email);
			console.log(c);
			console.log(c.photo);

			if (c && c.photo) {
				return c.photo;
			} else {
				return "/img/user_avatar_blank.jpg";
			}
		}
	});
}

Meteor.startup(function() {
	Meteor.users._ensureIndex( {"email": 1 }, { unique: true } );
});

Meteor.publish("teal.user_context", function() {
	if (Meteor.userId) {
		let context = { id: Meteor.userId };
		let u = Meteor.users.findOne({_id:Meteor.userId});
		if (u) {
			context.name = u.name;
			context.email = u.email;
			context.rootOrgId = u.rootOrgId;

			let c = ContributorsCollection.findOne({_id:u.contributorId});
			if (c) {
				context.physicalOrgId = c.physicalOrgId;
			}
		}

		return context;
	} else {
		return {};
	}
});
