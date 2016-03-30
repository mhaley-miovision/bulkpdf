import { Mongo } from 'meteor/mongo';

export const FeedbackCollection = new Mongo.Collection("teal.feedback");

if (Meteor.isServer) {
	Meteor.publish('teal.feedback', function() {
		return FeedbackCollection.find({});
	});
}
