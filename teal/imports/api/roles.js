import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const RolesCollection = new Mongo.Collection("teal.roles");

import { GoalsCollection } from './goals'
import { OrganizationsCollection } from './organizations'
import { ContributorsCollection } from './contributors'

import Permissions from '../api/permissions'

if (Meteor.isServer) {
	Meteor.publish('teal.roles', function() {
		return RolesCollection.find({});
	});

	Meteor.methods({

		"teal.roles.updateOrInsertRole": function(role)
		{
			// Make sure the user is logged in before inserting a task
			//TODO: perm check!!!
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			if (!role) {
				throw new Meteor.Error("invalid-role");
			}

			// Is there an existing role?
			let newRole = true;
			if (!!role._id) {
				// TODO: perform some validation here
				let oldRole = RolesCollection.findOne({_id:role._id});
				if (!oldRole) {
					throw new Meteor.Error("not-found");
				}
				newRole = false;
			}

			// cached role values
			//TODO: extract this into a method

			// organization cached info
			if (!!role.organizationId) {
				var org = OrganizationsCollection.findOne({_id:role.organizationId});
				if (!org) {
					throw new Meteor.Error("organization-not-found");
				}
				let newPath = _.clone(org.path);
				newPath.push(org._id); // full path includes this org as a parent
				role.path = newPath;

				role.organization = org.name; // TODO: fix finding by org
				role.rootOrgId = org.rootOrgId;

				// accountability label is derived from label + org
				role.accountabilityLabel = role.label + ", " + org.name;
			} else {
				throw new Meteor.Error("missing-organization");
			}
			// contributor cached info
			if (!!role.contributorId) {
				let contributor = ContributorsCollection.findOne({$or: [ {_id: role.contributorId}, {email: role.contributorId} ]});
				if (!contributor) {
					throw new Meteor.Error("contributor-not-found");
				}
				// copy contributor info into_id; // ensure this is not set to null the role
				role.contributor = contributor.name;
				role.email = contributor.email;
				role.photo = contributor.photo;
			}

			// update or create!
			if (newRole) {
				delete role._id; // ensure this is not set to null
				role._id = RolesCollection.insert(role);
			} else {
				RolesCollection.update(role._id, role);

				// update role cached instances

				// goal caches
				let relatedGoals = GoalsCollection.find(
					{$or: [{ownerRoles: {$elemMatch: {_id: role._id}}}, {contributorRoles: {$elemMatch: {_id: role._id}}}]},
					{fields: {_id: 1}}).fetch();

				// cached version
				let cachedRoleVersion = {
					_id: role._id,
					label: role.label,
					accountabilityLabel: role.accountabilityLabel,
					organizationId: role.organizationId,
					contributor: role.contributor,

				};

				// update the goals (owners and contributors)
				relatedGoals.forEach(g => {
					GoalsCollection.update(
						{ "ownerRoles._id" : role._id} ,
						{ $set: { "ownerRoles.$" : cachedRoleVersion } });
				});
				relatedGoals.forEach(g => {
					GoalsCollection.update(
						{ "contributorRoles._id" : role._id} ,
						{ $set: { "contributorRoles.$" : cachedRoleVersion } });
				});

				// update the role top goals
				Meteor.call("teal.goals.updateRoleTopLevelGoals", role._id);
			}
		},

		// TODO: utility match method - only call to fix cached values in case of data corruption
		"teal.roles.updateAllRoleTopLevelGoals": function() {
			"use strict";

			if (!!this.userId && Permissions.isAdmin()) {
				console.warn("Initiating role top level goal patch...");
				let n = GoalsCollection.find().count();
				let i = 0;
				GoalsCollection.find({}).forEach(r => {
					// update the role top goals
					Meteor.call("teal.goals.updateRoleTopLevelGoals", r._id);
					i++;
					console.warn(`Patched ${r._id}  (${ Math.floor(i / n * 100) }%)`);
				});
				console.warn("Patch complete!");
			} else {
				throw Meteor.Error("not-authorized");
			}
		},

		"teal.roles.removeRole": function(roleId) {
			//TODO: perm check!!!
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			if (!!roleId) {
				// remove from all goal instances
				GoalsCollection.update({ownerRoles: {$elemMatch: {_id: roleId}}}, {$pull: {ownerRoles: {_id: roleId}}});
				GoalsCollection.update({contributorRoles: {$elemMatch: {_id: roleId}}}, {$pull: {contributorRoles: {_id: roleId}}});

				// TODO: detach from contributor?

				// remove the role
				RolesCollection.remove({_id: roleId});
			} else {
				throw new Meteor.Error("missing-roleid");
			}
		},

		"teal.roles.removeRoleAssignment": function(roleId) {

		}
	});
}
