Meteor.methods({

	"teal.requests.create" : function(r) {
		// allowed request types
		if (!Teal.isAllowedChangeType(r.type)) {
			throw new Meteor.Error("not-allowed");
		}
	},

	"teal.requests.approve" : function(r) {
		// allowed request types
		if (!Teal.isAllowedChangeType(r.type)) {
			throw new Meteor.Error("not-allowed");
		}
	},

	"teal.requests.cancel" : function(r) {
		// allowed request types
		if (!Teal.isAllowedChangeType(r.type)) {
			throw new Meteor.Error("not-allowed");
		}
	},
});

Meteor.publish("teal.requests",function() {
	let r = RequestsCollection.find({});
});