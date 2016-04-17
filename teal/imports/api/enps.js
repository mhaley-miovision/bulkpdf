import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const EnpsCollection = new Mongo.Collection("teal.enps");

if (Meteor.isServer) {
	Meteor.publish('teal.enps', function() {
		return EnpsCollection.find({});
	});

	Meteor.methods({
		"teal.enps.submitEnps": function(enpsValue, enpsReason) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			var o = {
				rating: enpsValue,
				reason: enpsReason,
				createdAt: new Date(),
				userId: Meteor.user()._id,
				userName: Meteor.user().profile.name,
			};
			EnpsCollection.insert(o);
			Meteor.call("createNotification", { type:'enps.received', payload: o });
		}
	});
}
