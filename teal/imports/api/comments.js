import { Meteor } from 'meteor/meteor';
import { GoalsCollection } from './goals';
import { RolesCollection } from './roles';
import { OrganizationsCollection } from './organizations';
import { ContributorsCollection } from './contributors';

import Teal from '../shared/Teal'

if (Meteor.isServer) {
	Meteor.methods({
		"teal.comments.addComment": function (objectId, objectType, text, atMentions) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}
			let u = Meteor.users.findOne({_id:Meteor.userId()});
			if (u.contributorId) {
				let c = ContributorsCollection.findOne({_id:u.contributorId});

				let comment = {
					createdAt: Teal.newDateTime(),
					createdBy: Meteor.userId(),
					contributorId: c._id,
					photo: c.photo,
					name: c.name,
					email: c.email,
					text: text,
					atMentions: atMentions,
				};

				let op = { $push: { comments: { $each: [comment], $sort: {"createdAt":-1} } } };

				if (objectType === Teal.ObjectTypes.Goal) {
					GoalsCollection.update({_id:objectId}, op);
				} else if (objectType === Teal.ObjectTypes.Organization) {
					OrganizationsCollection.update({_id:objectId}, op);
				} else if (objectType === Teal.ObjectTypes.Role) {
					RolesCollection.update({_id:objectId}, op);
				}

			} else {
				throw new Meteor.Error("not-authorized");
			}
		},
		"teal.comments.deleteComment": function (objectId, objectType, commentId) {
			// Make sure the user is logged in before inserting a task
			if (!Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			let q = { _id: objectId, "comments._id" : commentId };
			let op  = { $pull: { "comments.$" : { _id: commentId } } };

			if (objectType === Teal.ObjectTypes.Goal) {
				GoalsCollection.update(q, op);
			} else if (objectType === Teal.ObjectTypes.Organization) {
				OrganizationsCollection.update(q, op);
			} else if (objectType === Teal.ObjectTypes.Role) {
				RolesCollection.update(q, op);
			}
		},
		"teal.comments.clear": function (objectId, objectType) {
			let q = { _id: objectId };
			let op = { $set: { comments: [] }};
			if (objectType === Teal.ObjectTypes.Goal) {
				GoalsCollection.update(q, op);
			} else if (objectType === Teal.ObjectTypes.Organization) {
				OrganizationsCollection.update(q, op);
			} else if (objectType === Teal.ObjectTypes.Role) {
				RolesCollection.update(q, op);
			}
		}
	});
}
