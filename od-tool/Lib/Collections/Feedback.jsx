FeedbackCollection = new Mongo.Collection("feedback");

if (Meteor.isServer) {
	Meteor.methods({
		submitFeedback(feedback) {
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
			Meteor.call("createNotification", n);
		}
	});
}