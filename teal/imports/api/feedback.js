import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const FeedbackCollection = new Mongo.Collection("teal.feedback");

if (Meteor.isServer) {
	Meteor.publish('teal.feedback', function() {
		return FeedbackCollection.find({});
	});

	Meteor.methods({
		"teal.feedback.submitFeedback": function(feedback) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			let o = {
				feedback: feedback,
				createdAt: new Date(),
				userId: Meteor.user()._id,
				userName: Meteor.user().profile.name,
			};
			FeedbackCollection.insert(o);

			// also send notification
			let n = {type: "feedback.received", payload: o};
			Meteor.call("teal.notification.createNotification", n);
		}
	});
}
