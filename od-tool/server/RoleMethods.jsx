Meteor.methods({
	"teal.roles.addRole": function(name, organizationId, contributorId, startDate, endDate) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// first check if there is another conflicting role
		var existing = RoleLabelsCollection.findOne({name: name});
		if (existing) {
			throw new Meteor.Error("duplicate");
		}

		RoleLabelsCollection.insert({
			name: name,
			createdAt: new Date(),
			createdBy: Meteor.user()._id,
		});
	},

	"teal.roles.removeRole": function(roleId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		RoleLabelsCollection.remove(roleId);
	},
});