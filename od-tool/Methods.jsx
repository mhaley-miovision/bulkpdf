// if these are removed from here it causes weirdness as partial subscriptions are loaded on the client
if (Meteor.isClient) {
	// This code is executed on the client only
	Meteor.subscribe("tasks");
	Meteor.subscribe("applications");
	Meteor.subscribe("organizations");
	Meteor.subscribe("org_accountabilities");
	Meteor.subscribe("role_accountabilities");
	Meteor.subscribe("role_labels");
	Meteor.subscribe("roles");
}

if (Meteor.isServer) {

}
