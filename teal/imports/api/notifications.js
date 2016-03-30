import { Mongo } from 'meteor/mongo';

export const NotificationsCollection = new Mongo.Collection("teal.notifications");

if (Meteor.isServer) {
	Meteor.publish('teal.notifications', function() {
		return NotificationsCollection.find({});
	});
}
