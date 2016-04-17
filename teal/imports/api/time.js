import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
	Meteor.methods({
		"teal.getServerDate": function () {
			return new Date();
		},
	});
}
