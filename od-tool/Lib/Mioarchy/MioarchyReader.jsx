function BuildMioarchyObjectFromDB() {
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

	if (typeof(Mioarchy) !== 'undefined') {
		console.log(Mioarchy);

		let mioarchy = new Mioarchy(
			roles, organizations, contributors, applications, roleLabels, orgAccountabilities, roleAccountabilities);
		return mioarchy;
	}
	console.log("5");

	return null;
}

if (Meteor.isServer) {
	Meteor.startup(function() {
		BuildMioarchyObjectFromDB();
	})
}