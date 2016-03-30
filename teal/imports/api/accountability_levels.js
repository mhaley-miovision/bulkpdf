import { Mongo } from 'meteor/mongo';

export const AccountabilityLevelsCollection = new Mongo.Collection("teal.accountability_levels");

if (Meteor.isServer) {
	Meteor.publish('teal.accountability_levels', function() {
		return AccountabilityLevelsCollection.find({});
	});
}
