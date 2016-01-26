Meteor.methods({
	addOrganization: function(name, parentOrgId, startDate, endDate) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// first check if there is another conflicting role
		var existing = OrganizationsCollection.findOne({name: name});
		if (existing) {
			throw new Meteor.Error("duplicate");
		}

		OrganizationsCollection.insert({
			name: name,
			startDate: startDate,
			endDate: endDate,
			createdAt: new Date(),
			createdBy: Meteor.user()._id,
		});
	},

	removeOrganization: function(organizationId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// Remove all roles associated with this organization

		// Remove the org itself
		OrganizationsCollection.remove(organizationId);
	},

	getOrganizationTree: function(organizationName) {
		console.log("organizationName: " + organizationName);

		// first check if it exists
		var existing = OrganizationsCollection.findOne({name: organizationName});
		if (existing) {
			// helper to build tree
			getOrgChildren = function(orgId) {
				var immediateChildren = OrganizationsCollection.find({parentId: orgId}).fetch();
				if (immediateChildren) {
					for (var c in immediateChildren) {
						c.children = getOrgChildren(c.id);
					}
				}
				return immediateChildren.length;
			}
			var ret = getOrgChildren(existing.id);
			return ret;

		} else {
			throw new Meteor.Error("missing");
		}
	},

	renameOrganization: function(organizationId, name) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// first check if there is another conflicting role
		var existing = OrganizationsCollection.findOne({name: name});
		if (existing) {
			throw new Meteor.Error("duplicate");
		}

		OrganizationsCollection.update(organizationId, {$set: {name: name}});
	},

	orgSearch: function(query) {
		if (query && query !== '') {
			find = {name: {$regex: new RegExp('.*' + query + '.*', "i")}};
		} else {
			find = {}
		}

		// TODO: nosql injection risk here!?
		return OrganizationsCollection.find(
			find,
			{fields: {name: 1, _id: 1, id: 1}}).fetch();
	}
});
