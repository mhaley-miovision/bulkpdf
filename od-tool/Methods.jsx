// if these are removed from here it causes weirdness as partial subscriptions are loaded on the client
if (Meteor.isClient) {
	// This code is executed on the client only
	Meteor.subscribe("teal.tasks");
	Meteor.subscribe("teal.applications");
	Meteor.subscribe("teal.organizations");
	Meteor.subscribe("teal.org_accountabilities");
	Meteor.subscribe("teal.role_accountabilities");
	Meteor.subscribe("teal.role_labels");
	Meteor.subscribe("teal.roles");
}

if (Meteor.isServer) {
}