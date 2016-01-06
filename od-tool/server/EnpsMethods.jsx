Meteor.methods({
	submitEnps(enpsValue, enpsReason) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		EnpsCollection.insert({
			enpsValue: enpsValue,
			enpsReason: enpsReason,
			createdAt: new Date(),
			userId: Meteor.user()._id,
			userName: Meteor.user().profile.name,
		});a
	}
});