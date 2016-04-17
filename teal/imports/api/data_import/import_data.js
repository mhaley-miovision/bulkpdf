import { Meteor } from 'meteor/meteor';

Meteor.methods({
	"teal.import.importAllData": function () {
		/*
		Meteor.call("teal.import.importGoogleSpreadsheetDatabase");
		Meteor.call("teal.import.importGoals");*/
		Meteor.call("teal.import.importUserPhotoInfo");
	}
});
