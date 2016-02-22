Permissions = {
	isEnabledUser() {
		return Roles.userIsInRole(Meteor.user(), "enabledUser");
	},
	isAdminUser() {
		return Roles.userIsInRole(Meteor.user(), "admin");
	}
}