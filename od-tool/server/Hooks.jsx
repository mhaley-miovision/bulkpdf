Hooks.onLoggedIn = function (userId)
{
	let o = {
		userId: userId
	};
	Meteor.call("createNotification", { type: 'user.logged_in', payload: o});
	console.log(userId + " logged in.")
}

Hooks.onLoggedOut = function (userId)
{
	console.log(userId + " logged out.")
	let o = {
		userId: userId
	};
	Meteor.call("createNotification", { type: 'user.logged_out', payload: o});
}