Meteor.methods({

	"teal.changes.create" : function(c) {
		// allowed request types
		if (!Teal.isAllowedChangeType(c.type)) {
			throw new Meteor.Error("not-allowed");
		}

		c.createdBy = Meteor.userId();

		let contributor = ContributorsCollection.findOne({_id:Meteor.userId()});
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