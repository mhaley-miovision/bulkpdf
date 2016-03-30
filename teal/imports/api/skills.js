import { Mongo } from 'meteor/mongo';

export const SkillsCollection = new Mongo.Collection("teal.skills");

if (Meteor.isServer) {
	Meteor.publish('teal.skills', function() {
		return SkillsCollection.find({});
	});
}
