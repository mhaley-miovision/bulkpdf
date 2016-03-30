import { Mongo } from 'meteor/mongo';

export const GoogleUserCacheCollection = new Mongo.Collection("teal.google_users_cache");

if (Meteor.isServer) {
	Meteor.publish('teal.google_users_cache', function() {
		return GoogleUserCacheCollection.find({});
	});
}
