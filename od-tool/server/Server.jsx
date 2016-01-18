
Meteor.publish("applications", function () {
	return ApplicationsCollection.find({});
});
Meteor.publish("organizations", function () {
	return OrganizationsCollection.find({});
});
Meteor.publish("org_accountabilities", function () {
	return OrgAccountabilitiesCollection.find({});
});
Meteor.publish("role_accountabilities", function () {
	return RoleAccountabilitiesCollection.find({});
});
Meteor.publish("role_labels", function () {
	return RoleLabelsCollection.find({});
});
Meteor.publish("roles", function () {
	return RolesCollection.find({});
});