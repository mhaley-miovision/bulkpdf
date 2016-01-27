Meteor.methods({

	addGoal(text) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var goal = GoalsCollection.insert({
			description: text,
			createdAt: new Date(),
			owner: Meteor.user()._id,
			username: Meteor.user().profile.name
		});

		return goal; // to retrieve the ID
	},

	removeGoal(goalId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.remove(goalId);
	},

	setGoalCompleted(goalId, completed) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(goalId, {$set: {completed: completed}});
	},

	setGoalPrivate(goalId, setToPrivate) {
		const goal = GoalsCollection.findOne(goalId);

		// Make sure only the task owner can make a task private
		if (goal.owner !== Meteor.user().profile._id) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(goalId, {$set: {private: setToPrivate}});
	},

	renameGoal(goalId, name) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(goalId, {$set: {name: name}});
	}
});

// Only publish goals that are public or belong to the current user
Meteor.publish("goals", function () {
	return GoalsCollection.find({
		$or: [
			{ private: {$ne: true} },
			{ owner: this.userId }
		]
	});
});