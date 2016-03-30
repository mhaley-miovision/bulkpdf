import { Mongo } from 'meteor/mongo';

export const ContributorsCollection = new Mongo.Collection("teal.enps");

if (Meteor.isServer) {
	Meteor.publish('teal.enps', function() {
		return EnpsCollection.find({});
	});
}
