import { Mongo } from 'meteor/mongo';

export const TasksCollection = new Mongo.Collection("teal.tasks");

if (Meteor.isServer) {
	console.log("publishing tasks...");

	// This code only runs on the server
	Meteor.publish('teal.tasks', function tasksPublication() {
		return TasksCollection.find({});
	});
}
