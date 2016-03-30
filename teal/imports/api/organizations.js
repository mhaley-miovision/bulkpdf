import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const OrganizationsCollection = new Mongo.Collection("teal.organizations");

if (Meteor.isServer) {
	Meteor.publish('teal.organizations', function() {
		return OrganizationsCollection.find({});
	});

	Meteor.methods({
		"teal.orgs.updateOrInsertOrg": function(org) {
			//TODO:perm check!!
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			if (!org) {
				throw new Meteor.Error("invalid-org");
			}

			// find the existing org
			let newOrg = true;
			if (!!org._id) {
				// TODO: perform some validation here
				let oldOrg = OrganizationsCollection.findOne({_id:org._id});
				if (!oldOrg) {
					throw new Meteor.Error("not-found");
				}
				newOrg = false;
			} else {
				org.createdOn = Teal.newDateTime();
				org.createdBy = Meteor.userId();
			}

			if (!!org.parentId) {
				let parent = OrganizationsCollection.findOne({_id:org.parentId});
				if (!!parent) {
					org.parent = parent.name;
				} else {
					throw new Meteor.Error("parent-not-found");
				}
			} else {
				throw new Meteor.Error("missing-parent-org");
			}

			if (newOrg) {
				delete org._id;
				org._id = OrganizationsCollection.insert(org);
			} else {
				OrganizationsCollection.update(org._id, org);
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
				// First, remove all the children
				let children = OrganizationsCollection.find({parentId:organizationId});
				children.forEach(c => {
					Meteor.call("teal.orgs.removeOrganization", c._id);
				});

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

}
