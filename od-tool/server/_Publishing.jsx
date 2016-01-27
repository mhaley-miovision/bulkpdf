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

Meteor.publish("contributors", function () {
	return ContributorsCollection.find({});
});

// Only publish users if the client is an admin
Meteor.publish("users", function () {
	return Meteor.users.find({},
		{ 'fields': {
			'user': 1,
			'services.google.email': 1,
			'services.google.name': 1,
			'services.google.given_name': 1,
			'services.google.family_name': 1,
			'services.google.picture': 1,
			'services.google.gender': 1
		}});
});

// Only publish goals that are public
Meteor.publish("goals", function () {
	return GoalsCollection.find({
		$or: [
			{ private: {$ne: true} },
		]
	});
});


// Only publish tasks that are public or belong to the current user
Meteor.publish("tasks", function () {
	return TasksCollection.find({
		$or: [
			{ private: {$ne: true} },
			{ owner: this.userId }
		]
	});
});