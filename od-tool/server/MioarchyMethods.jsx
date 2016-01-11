Meteor.methods({
	loadMioarchy() {
		// read applications
		let applications = [];
		ApplicationsCollection.find({}).forEach(function(a) {
			applications[a.name] = a;
		});
		// read organizations
		let organizations = [];
		OrganizationsCollection.find({}).forEach(function(o) {
			organizations[o.name] = o;
		});
		// read contributors
		let contributors = [];
		ContributorsCollection.find({}).forEach(function(c) {
			contributors[c.name] = c;
		});
		// read org accountabilities
		let orgAccountabilities = [];
		OrgAccountabilitiesCollection.find({}).forEach(function(oa) {
			orgAccountabilities[oa.name] = oa;
		});
		// read role accountabilities
		let roleAccountabilities = [];
		RoleAccountabilitiesCollection.find({}).forEach(function(r) {
			roleAccountabilities[r.id] = r;
		});
		// read applications
		let roleLabels = [];
		RoleLabelsCollection.find({}).forEach(function(rl) {
			roleLabels[rl.name] = rl;
		});
		// read roles
		let roles = [];
		RolesCollection.find({}).forEach(function(r) {
			roles[r.id] = r;
		});

		let mioarchy = new Meteor.Mioarchy(
			roles, organizations, contributors, applications, roleLabels, orgAccountabilities, roleAccountabilities);

		return mioarchy;
	},
});

Meteor.publish("applications", function () {
	return ApplicationsCollection.find({});
});
Meteor.publish("organizations", function () {
	return OrganizationsCollection.find({});
});
Meteor.publish("org_accountabilities", function () {
	return OrgAccountabilitiesCollection.find({});
});
Meteor.publish("role_accountabilities", function () {
	return RoleAccountabilitiesCollection.find({});
});
Meteor.publish("role_labels", function () {
	return RoleLabelsCollection.find({});
});
Meteor.publish("roles", function () {
	return RolesCollection.find({});
});