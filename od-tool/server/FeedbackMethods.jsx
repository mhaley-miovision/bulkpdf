Meteor.methods({
	submitFeedback(feedback) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		FeedbackCollection.insert({
			feedback: feedback,
			createdAt: new Date(),
			userId: Meteor.user()._id,
			userName: Meteor.user().profile.name,
		});
	}
});