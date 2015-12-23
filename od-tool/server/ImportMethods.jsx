function importHelper_transformApplication(a) {
	return a;
}
function importHelper_transformOrganization(o) {
	return o;
}
function importHelper_transformJob(j) {
	return j;
}
function importHelper_transformOrgAccountability(oa) {
	return oa;
}
function importHelper_transformJobAccountability(jl) {
	return jl;
}
function importHelper_transformContributor(c) {
	return c;
}
function importHelper_transformRoleLabel(rl) {
	return rl;
}


Meteor.methods({

	v1ImportDatabase() {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var v1BaseURL = "http://ec2-54-152-211-94.compute-1.amazonaws.com/";

		console.log("Calling get...");

		// drop all existing data (!)
		ApplicationsCollection.remove({});
		ContributorsCollection.remove({});
		OrgAccountabilitiesCollection.remove({});
		OrganizationsCollection.remove({});
		RoleAccountabilitiesCollection.remove({});
		RolesCollection.remove({});
		RoleLabelsCollection.remove({});

		var contributors = Meteor.http.call("GET", v1BaseURL + "contributors");
		var roleLabels = Meteor.http.call("GET", v1BaseURL + "roles");
		var applications = Meteor.http.call("GET", v1BaseURL + "applications");
		var jobAccountabilities = Meteor.http.call("GET", v1BaseURL + "jobAccountabilities");
		var organizations = Meteor.http.call("GET", v1BaseURL + "organizations");
		var orgAccountabilities = Meteor.http.call("GET", v1BaseURL + "orgAccountabilities");
		var jobs = Meteor.http.call("GET", v1BaseURL + "jobs");

		for (var c in contributors.data) {
			ContributorsCollection.insert(importHelper_transformContributor(contributors.data[c]));
		}
		for (var o in organizations.data) {
			OrganizationsCollection.insert(importHelper_transformOrganization(organizations.data[o]));
		}
		for (var rl in roleLabels.data) {
			RoleLabelsCollection.insert(importHelper_transformRoleLabel(roleLabels.data[rl]));
		}
		for (var a in applications.data) {
			ApplicationsCollection.insert(importHelper_transformApplication(applications.data[a]));
		}
		for (var oa in orgAccountabilities.data) {
			ContributorsCollection.insert(importHelper_transformOrgAccountability(orgAccountabilities.data[oa]));
		}
		for (var ja in jobAccountabilities.data) {
			RoleAccountabilitiesCollection.insert(importHelper_transformJobAccountability(jobAccountabilities.data[ja]));
		}
		for (var rl in roleLabels.data) {
			ContributorsCollection.insert(importHelper_transformRoleLabel(roleLabels.data[rl]));
		}

		console.log("Done!");
	}
});