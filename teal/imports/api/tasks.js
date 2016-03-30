import { Mongo } from 'meteor/mongo';

export const TasksCollection = new Mongo.Collection("teal.tasks");

if (Meteor.isServer) {
	Meteor.publish('teal.tasks', function() {
		return TasksCollection.find({});
	});
}
