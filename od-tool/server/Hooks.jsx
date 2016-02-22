Hooks.onLoggedIn = function (userId)
{
	let o = {
		userId: userId
	};

	let u = Meteor.users.findOne({_id:userId});
	if (u && !u.email && u.services && u.services.google.email) {
		// attach an email to this user from their Google account
		Meteor.users.update(userId,{$set:{email: u.services.google.email}});
	}

	Meteor.call("teal.notifications.createNotification", { type: 'user.logged_in', payload: o});
	console.log(userId + " logged in.")
}

Hooks.onLoggedOut = function (userId)
{
	console.log(userId + " logged out.")
	let o = {
		userId: userId
	};

	Meteor.call("teal.notifications.createNotification", { type: 'user.logged_out', payload: o});
}