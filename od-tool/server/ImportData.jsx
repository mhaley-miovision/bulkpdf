Meteor.methods({
	//TODO: refactor this to use creation method and unify actions on create
	"teal.import.importAllData": function () {
		Meteor.call("teal.import.importGoogleSpreadsheetDatabase");
		Meteor.call("teal.import.importGoals");
		Meteor.call("teal.import.importUserPhotoInfo");
	}
});