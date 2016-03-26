
// Validate username, sending a specific error message on failure.
Accounts.validateNewUser(function (user) {
	console.log("--==( Accounts.validateNewUser )==--");
	if (user) {
		// for now just Google sign in is permitted
		let u = user;
		if (u && !u.email && u.services && u.services.google.email) {
			let email = u.services.google.email;

			// if there is a contributor associated, allow it
			let c = ContributorsCollection.findOne({email:email});
			if (c) {
				console.log(`Accounts.validateNewUser('${u._id}') - found contributor - '${c.name}'`);
				return true;
			}

			// custom enabled users
			var enabledUsers = ['ryan.burgio@gmail.com','leipnik@gmail.com','darlenescott78@gmail.com'];
			if (enabledUsers.indexOf(email) >= 0) {
				console.log(`Accounts.validateNewUser('${u._id}') - used part of custom enabled users - '${email}'`);
				return true;
			}

			// enable all miovision users by default
			if (email.indexOf("@miovision.com") >= 0) {
				console.log(`Accounts.validateNewUser('${u._id}') - user is Miovision employee - '${email}'`);
				return true;
			}
		}
	}
	console.error("Accounts.validateNewUser FAILED");
	console.error(JSON.stringify(user, null, '\t'));

	/*
	Meteor.call("teal.email.sendEmail",
	{
		to:"vleipnik@miovision.com",
		from:"teal@miovision.com",
		subject: "Unauthorized user attempted login!",
		text:"User: " + JSON.stringify(user),
		html:""
	});*/

	throw new Meteor.Error(403, "This user is not enabled.");
});
