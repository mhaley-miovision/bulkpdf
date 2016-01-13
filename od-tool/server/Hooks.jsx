Hooks.onLoggedIn = function (userId)
{
	console.log(userId + " logged in.")
}

Hooks.onLoggedOut = function (userId)
{
	console.log(userId + " logged out.")
	FlowRouter.go("/");
}