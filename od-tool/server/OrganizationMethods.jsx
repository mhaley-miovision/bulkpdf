Meteor.methods({
	"teal.orgs.updateOrInsertOrg": function(orgId, name, parentOrgId, startDate, endDate) {
		//TODO:perm check!!
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// find the existing org
		let org = {};
		let newOrg = true;
		if (!!orgId) {
			org = OrganizationsCollection.findOne({_id:orgId});
			if (!org) {
				throw new Meteor.Error("not-found");
			}
			newOrg = false;
		} else {
			org.createdOn = Teal.newDateTime();
			org.createdBy = Meteor.userId();
		}

		if (!!parentOrgId) {
			parentOrg = OrganizationsCollection.findOne({_id:parentOrgId});
			if (!parentOrg) {
				throw new Meteor.Error("parent-not-found");
			}
		} else {
			throw new Meteor.Error("missing-parent-org");
		}

		org.name = name;
		org.startDate = startDate;
		org.endDate = endDate;
		org.parentId = parentOrgId;
		org.parent = parentOrg.name;
		org.type = 'organization';

		if (newOrg) {
			org._id = OrganizationsCollection.insert(org);
		} else {
			OrganizationsCollection.update(orgId, org);
		}

		Meteor.call("teal.orgs.updateCachedOrgValues", org._id);
	},

	"teal.orgs.updateCachedOrgValues": function(orgId) {
		let o = OrganizationsCollection.findOne({_id: orgId});
		let path = [];
		while (o.parentId) {
			let p = OrganizationsCollection.findOne({_id: o.parentId});
			path.push(o.parentId);
			o = p; // traverse upwards
		}
		path.reverse();

		OrganizationsCollection.update(orgId, {$set: { path: path}});
	},

	"teal.orgs.renameOrganization": function(organizationId, name) {
		//TODO:perm check!!
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		OrganizationsCollection.update(organizationId, {$set: {name: name}});
	},

	"teal.orgs.removeOrganization": function(organizationId) {
		// TODO: perm check!!
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		if (!!organizationId) {
			// Remove all roles associated with this organization
			let roles = RolesCollection.find({organizationId: organizationId}).forEach(r => {
				Meteor.call("teal.roles.removeRole", r._id);
			});
			// Remove the org itself
			OrganizationsCollection.remove({_id: organizationId});
		} else {
			throw new Meteor.Error("missing-orgid");
		}
	},

	"teal.orgs.getOrganizationTree": function(organizationName) {
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
});
