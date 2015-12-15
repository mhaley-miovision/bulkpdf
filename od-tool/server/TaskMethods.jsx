
Meteor.methods({
	addTask(text) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		Tasks.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.user()._id,
			username: Meteor.user().profile.name
		});
	},

	removeTask(taskId) {
		Tasks.remove(taskId);
	},

	setChecked(taskId, setChecked) {
		Tasks.update(taskId, {$set: {checked: setChecked}});
	},

	setPrivate(taskId, setToPrivate) {
		const task = Tasks.findOne(taskId);

		// Make sure only the task owner can make a task private
		if (task.owner !== Meteor.user().profile._id) {
			throw new Meteor.Error("not-authorized");
		}

		Tasks.update(taskId, {$set: {private: setToPrivate}});
	}
});