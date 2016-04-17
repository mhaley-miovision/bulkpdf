import { Meteor } from 'meteor/meteor'
import { GoalsCollection } from './goals'
import { RolesCollection } from './roles'
import { OrganizationsCollection } from './organizations'
import { ContributorsCollection } from './contributors'

import { FlowRouter } from 'meteor/kadira:flow-router'

import Teal from '../shared/Teal'
import Routing from './routing'

if (Meteor.isServer) {
	Meteor.methods({
		"teal.comments.addComment": function (objectId, objectType, text, atMentions, url) {
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
				let objectName = '';

				// TODO: decoupling event from even processing is important.
				// TODO: consider how much of this should go into the notification vs. here.

				if (objectType === Teal.ObjectTypes.Goal) {
					GoalsCollection.update({_id:objectId}, op);
					objectName = GoalsCollection.findOne({_id:objectId},{fields:{name:1}}).name;
				} else if (objectType === Teal.ObjectTypes.Organization) {
					OrganizationsCollection.update({_id:objectId}, op);
					objectName = OrganizationsCollection.findOne({_id:objectId},{fields:{name:1}}).name;
				} else if (objectType === Teal.ObjectTypes.Role) {
					RolesCollection.update({_id:objectId}, op);
					objectName = RolesCollection.findOne({_id:objectId},{fields:{accountabilityLabel:1}}).accountabilityLabel;
				}
				let mentionedSubject = `${c.name} mentioned you in '${objectName}'`;
				let mentionBody = `You have a new mention in the ${objectType} <a href="${url}">${objectName}</a> by ${c.name}.<br><br><i><q>${text}</q></i>.<br><br><a href="${url}">Click here to collaborate!</a></i>"`;

				// do this for each user email
				atMentions.forEach(mentionedUserEmail => {
					let notification = {
						type: 'comments.atMentioned',
						payload: { subject: mentionedSubject, body: mentionBody, email: mentionedUserEmail }
					};
					// insert the notification
					Meteor.call("teal.notifications.createNotification", notification);
				});

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
