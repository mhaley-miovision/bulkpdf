
// Validate username, sending a specific error message on failure.
Accounts.validateNewUser(function (user) {
	if (user) {
		console.log("Accounts.validateNewUser");

		// for now just Google sign in is permitted
		let u = user;
		if (u && !u.email && u.services && u.services.google.email) {
			let email = u.services.google.email;

			// if there is a contributor associated, allow it
			let c = ContributorsCollection.findOne({email:email});
			if (c) {
				return true;
			}

			// custom enabled users
			var enabledUsers = ['leipnik@gmail.com'];
			if (enabledUsers.indexOf(email) >= 0) {
				return true;
			}

			// enable all miovision users by default
			if (email.indexOf("@miovision.com")) {
				return true;
			}
		}
	}
	console.error("Accounts.validateNewUser FAILED -- ");
	console.log(user);
	throw new Meteor.Error(403, "This user is not enabled.");
});
