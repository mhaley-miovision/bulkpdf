import { Mongo } from 'meteor/mongo';

export const RoleAccountabilitiesCollection = new Mongo.Collection("teal.role_accountabilities");

if (Meteor.isServer) {
	Meteor.publish('teal.role_accountabilities', function() {
		return RoleAccountabilitiesCollection.find({});
	});
}
