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
		},

		getMyEmail() {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			console.log(Meteor.user().services.google.email);

			return Meteor.user().services.google.email;
		},

		importUserPhotoInfo() {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var myjson = JSON.parse(Assets.getText("users.json"));

			// update contributors photos
			var notFoundString = "";
			var updatedCount = 0;
			for (var x in myjson) {
				var o = myjson[x];
				var c = ContributorsCollection.findOne({email: x});
				if (c && o.photo) {
					c.photo = o.photo;
					ContributorsCollection.update(c._id, c);
					updatedCount++;
				} else {
					notFoundString += x + ", " + o.name + (o.photo ? o.photo : "") + "\n";
				}
			}

			var email = "Updated " + updatedCount + " photo urls.\n\n\nUnknown contributors:\n\n" + notFoundString;
			Email.send({
				from:"teal@miovision.com",
				to:"vleipnik@miovision.com",
				subject:"User photos imported",
				text:email
			})

			return true;
		},

		getPhotoUrlByUserName(userName) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			var c = ContributorsCollection.findOne({name: userName});
			if (c && c.photo) {
				return c.photo;
			} else {
				return "img/user_avatar_blank.jpg";
			}
		},

		getPhotoUrlByUserEmail(email) {
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
				return "img/user_avatar_blank.jpg";
			}
		}
	});
}