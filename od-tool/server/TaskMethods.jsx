Meteor.methods({
	addTask(text) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		TasksCollection.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.user()._id,
			username: Meteor.user().profile.name
		});
	},

	removeTask(taskId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		TasksCollection.remove(taskId);
	},

	setChecked(taskId, setChecked) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		TasksCollection.update(taskId, {$set: {checked: setChecked}});
	},

	setPrivate(taskId, setToPrivate) {
		const task = TasksCollection.findOne(taskId);

		// Make sure only the task owner can make a task private
		if (task.owner !== Meteor.user().profile._id) {
			throw new Meteor.Error("not-authorized");
		}
		TasksCollection.update(taskId, {$set: {private: setToPrivate}});
	}
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