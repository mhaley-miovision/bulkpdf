import { Mongo } from 'meteor/mongo';

export const RolesCollection = new Mongo.Collection("teal.roles");

if (Meteor.isServer) {
	Meteor.publish('teal.roles', function() {
		return RolesCollection.find({});
	});
}
