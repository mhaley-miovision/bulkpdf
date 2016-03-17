

Hooks.onLoggedIn = function (userId)
{
	let u = Meteor.users.findOne({_id:userId});
	if (!!u.initialized) {
		let o = {
			userId: userId,
			userName: u.profile.name,
		};
		Meteor.call("teal.notifications.createNotification", { type: 'user.logged_in', payload: o});
		console.log(userId + " logged in.")
	} else {
		initializeUser(userId);
	}
}

initializeUser = function (userId) {
	let u = Meteor.users.findOne({_id:userId});

	console.log("*** Initializing user: " + userId + " ****");
	console.log(u);

	if (!u.services.google) {
		console.warn("User has no services attached yet. Cannot initialize.");
		return;
	}

	let email = u.services.google.email;
	Roles.addUsersToRoles(userId, 'enabled'); //TODO:fix groups to work properly , rootOrgId);

	// admins
	var adminUsers = ['vleipnik@miovision.com', 'jreeve@miovision.com',
		'jwincey@miovision.com', 'jbhavnani@miovision.com', 'lgreig@miovision.com', 'kmcbride@miovision.com',
		'tbrijpaul@miovision.com', 'ndumond@miovision.com', 'dbullock@miovision.com', 'bward@miovision.com',
		'bpeters@miovision.com'];
	if (adminUsers.indexOf(email) >= 0) {
		Roles.addUsersToRoles(userId, 'admin'); //TODO:fix groups to work properly , rootOrgId);
	}

	// is user's contributor initialized?
	if (!u.contributorId) {
		let c = ContributorsCollection.findOne({email:email});
		if (!c) {
			console.warn("Warning: user " + userId + " has no contributor.");
			return;
		}

		// link back to the user
		ContributorsCollection.update(c._id, {$set: {userId: userId}});

		// update the user object
		Meteor.users.update(userId, {$set: { rootOrgId: c.rootOrgId, email: email, contributorId: c._id, initialized: true }});

		if (c.isLeadNode || email === 'vleipnik@miovision.com') { // personal backdoor hack
			Roles.addUsersToRoles(userId, 'designer');
		}
	}
}

Hooks.onLoggedOut = function (userId)
{
	let c = ContributorsCollection.findOne({userId:userId});
	if (!c) {
		console.error("Hooks.onLoggedOut -- " + userId + " has no contributor attached.");
		return;
	}
	let o = {
		userId: userId,
		userName: c.name
	};
	Meteor.call("teal.notifications.createNotification", { type: 'user.logged_out', payload: o});
	console.log(userId + " logged out.")
}