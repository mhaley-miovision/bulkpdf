if (Meteor.isClient) {
	// This code is executed on the client only
	Meteor.subscribe("tasks");
}

if (Meteor.isServer) {
	// Only publish tasks that are public or belong to the current user
	Meteor.publish("tasks", function () {
		return Tasks.find({
			$or: [
				{ private: {$ne: true} },
				{ owner: this.userId }
			]
		});
	});
}