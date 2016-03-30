import { Meteor } from 'meteor/meteor';

export default {
	isEnabled() {
		return Roles.userIsInRole(Meteor.user(), "enabled");
	},
	isAdmin() {
		return Roles.userIsInRole(Meteor.user(), "admin");
	},
	isDesigner() {
		return Roles.userIsInRole(Meteor.user(), "designer");
	}
}
