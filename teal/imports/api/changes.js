import { Mongo } from 'meteor/mongo';

export const ChangesCollection = new Mongo.Collection("teal.changes");

if (Meteor.isServer) {
	Meteor.publish('teal.changes', function() {
		return ChangesCollection.find({});
	});
}
