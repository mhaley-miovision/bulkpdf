import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ContributorsCollection = new Mongo.Collection("teal.contributors");

if (Meteor.isServer) {
	Meteor.publish('teal.contributors', function() {
		return ContributorsCollection.find({});
	});
}
