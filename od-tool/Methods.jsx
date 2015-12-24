if (Meteor.isClient) {
	// This code is executed on the client only
	Meteor.subscribe("tasks");
	Meteor.subscribe("role_labels");
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
	// Publish all roles
	Meteor.publish("role_labels", function () {
		return RoleLabelsCollection.find({});
	});
}
