import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import Teal from '../shared/Teal'
import TealChanges from '../shared/TealChanges'

import {ContributorsCollection} from './contributors'

export const ChangesCollection = new Mongo.Collection("teal.changes");

const MAX_CHANGES_VISIBLE = 50;

if (Meteor.isServer) {
	Meteor.publish('teal.changes', function() {
		if (!!this.userId) {
			return ChangesCollection.find({},{sort:{createdAt:-1},limit:MAX_CHANGES_VISIBLE});
		} else {
			return this.ready();
		}
	});

	Meteor.methods({
		"teal.changes.create" : function(c) {
			// allowed request types
			if (!TealChanges.isAllowedChangeType(c.type)) {
				throw new Meteor.Error("not-allowed");
			}

			c.createdBy = Meteor.userId();

			let u = Meteor.users.findOne({_id:Meteor.userId()});
			let email = u.email;
			let contributor = ContributorsCollection.findOne({email:email});

			if (!!contributor) {
				c.createdByName = contributor.name;
				c.photo = contributor.photo;
				c.createdAt = Teal.newDateTime();
				c.executedAt = null;
				c.approvedBy = null;

				let changeId = ChangesCollection.insert(c);
				c._id = changeId;

				if (c.apply === Teal.ApplyTypes.Immediate) {
					Meteor.call("teal.changes.execute", changeId);
				}
				return c;
			} else {
				throw new Meteor.Error("contributor-not-found");
			}
		},

		"teal.changes.execute": function(changeId) {
			let c = ChangesCollection.findOne({_id:changeId});
			if (!c) {
				throw new Meteor.Error("not-found");
			}

			c.executedAt = Teal.newDateTime();

			try {
				// first param is the method
				let params = [c.changeMethod].concat(c.changeParams);
				c.result = Meteor.call.apply(Meteor, params);
			} catch (e) {
				c.result = e;
				console.error("teal.changes.execute FAILED");
				console.error(c);
				throw new Meteor.Error("execute-change-failed")
			}

			ChangesCollection.update(changeId, c);
		},

		"teal.changes.approve" : function(changeId) {
		},

		"teal.changes.cancel" : function(changeId) {
		},

		"teal.changes.clearList" : function() {
			// TODO: do this only per user
			ChangesCollection.remove({});
		}
	});
}

