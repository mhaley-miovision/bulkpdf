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
	// Only publish tasks that are public or belong to the current user
	Meteor.publish("tasks", function () {
		return TasksCollection.find({
			$or: [
				{ private: {$ne: true} },
				{ owner: this.userId }
			]
		});
	});
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
}
