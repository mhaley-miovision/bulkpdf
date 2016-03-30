import { Mongo } from 'meteor/mongo';

export const OrganizationsCollection = new Mongo.Collection("teal.organizations");

if (Meteor.isServer) {
	Meteor.publish('teal.organizations', function() {
		return OrganizationsCollection.find({});
	});
}
