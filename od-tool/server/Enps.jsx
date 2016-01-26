if (Meteor.isServer) {
	Meteor.methods({
		submitEnps(enpsValue, enpsReason) {
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