import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const TasksCollection = new Mongo.Collection("teal.tasks");

if (Meteor.isServer) {
	Meteor.publish('teal.tasks', function() {
		return TasksCollection.find({});
	});

	Meteor.methods({
		"teal.tasks.addTask": function(text) {
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

		"teal.tasks.removeTask": function(taskId) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			TasksCollection.remove(taskId);
		},

		"teal.tasks.setChecked": function(taskId, setChecked) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			TasksCollection.update(taskId, {$set: {checked: setChecked}});
		},

		"teal.tasks.setPrivate": function(taskId, setToPrivate) {
			const task = TasksCollection.findOne(taskId);

			// Make sure only the task owner can make a task private
			if (task.owner !== Meteor.user().profile._id) {
				throw new Meteor.Error("not-authorized");
			}
			TasksCollection.update(taskId, {$set: {private: setToPrivate}});
		}
	});

}
