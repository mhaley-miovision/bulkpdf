import { Mongo } from 'meteor/mongo';

export const GoalsCollection = new Mongo.Collection("teal.goals");

if (Meteor.isServer) {
	Meteor.publish('teal.goals', function() {
		return GoalsCollection.find({});
	});
}
