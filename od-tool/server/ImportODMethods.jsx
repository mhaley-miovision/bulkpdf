function importHelper_transformApplication(x) {
	x.type = 'application';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}
function importHelper_transformOrganization(x) {
	x.type = "organization";
	x.name = x.name.trim();
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}
function importHelper_transformRole(x) {
	x.type = 'role';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}
function importHelper_transformOrgAccountability(x) {
	x.type = 'org_accountability';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}
function importHelper_transformJobAccountability(x, id) {
	x.id = id;
	x.type = 'role_accountability';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}
function importHelper_transformContributor(x) {
	x.type = 'contributor';
	if (x.email.indexOf(" ") > 0) {
		x.email = x.email.replace(/ /g, "");
	}
	x.name = x.name.trim();
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}
function importHelper_transformRoleLabel(x) {
	x.type = 'role_label';
	x.name = x.name.trim();
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	return x;
}

var url = "https://spreadsheets.google.com/feeds/worksheets/1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ/public/basic?alt=json";
var skillsCellFeed = "https://spreadsheets.google.com/feeds/cells/1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ/ov5rkqr/public/basic?alt=json";
function processSkillsJson(json) {
	var cellItems = json.feed.entry;

	var res = [];
	for (e in cellItems) {
		var o = cellItems[e];
		res[o.title.$t] = o.content.$t;
	}

	c = res;

	var startRow = 2;
	var blankRowCount = 0;
	var r = startRow;

	var skills = [];

	while (r++ < 2000) {
		// stop if exceeded blank row coun
		//
		// t
		if (typeof(c["C"+r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}

		var email = res['C'+r];
		var skill = res['D'+r];
		var rating = res['E'+r];
		skills.push({email:email, skill:skill, rating:rating });
	}

	return skills;
}

Meteor.methods({
	v1ImportDatabase() {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var v1BaseURL = "http://ec2-54-152-211-94.compute-1.amazonaws.com/";

		// drop all existing data (!)
		ApplicationsCollection.remove({});
		ContributorsCollection.remove({});
		OrganizationsCollection.remove({});
		OrgAccountabilitiesCollection.remove({});
		RoleAccountabilitiesCollection.remove({});
		RolesCollection.remove({});
		RoleLabelsCollection.remove({});
		SkillsCollection.remove({});

		var contributors = Meteor.http.call("GET", v1BaseURL + "contributors");
		var roleLabels = Meteor.http.call("GET", v1BaseURL + "roles");
		var applications = Meteor.http.call("GET", v1BaseURL + "applications");
		var jobAccountabilities = Meteor.http.call("GET", v1BaseURL + "jobAccountabilities");
		var organizations = Meteor.http.call("GET", v1BaseURL + "organizations");
		var orgAccountabilities = Meteor.http.call("GET", v1BaseURL + "orgAccountabilities");
		var roles = Meteor.http.call("GET", v1BaseURL + "jobs");

		for (var x in applications.data) {
			ApplicationsCollection.insert(importHelper_transformApplication(applications.data[x]));
		}
		for (var x in contributors.data) {
			ContributorsCollection.insert(importHelper_transformContributor(contributors.data[x]));
		}
		for (var x in organizations.data) {
			OrganizationsCollection.insert(importHelper_transformOrganization(organizations.data[x]));
		}
		for (var x in orgAccountabilities.data) {
			OrgAccountabilitiesCollection.insert(importHelper_transformOrgAccountability(orgAccountabilities.data[x]));
		}
		for (var x in jobAccountabilities.data) {
			RoleAccountabilitiesCollection.insert(importHelper_transformJobAccountability(jobAccountabilities.data[x], x));
			console.log(jobAccountabilities.data[x]);
		}
		for (var x in roles.data) {
			var r_id = RolesCollection.insert(importHelper_transformRole(roles.data[x]));
			var c = ContributorsCollection.findOne({name:roles.data[x].contributor});
			if (c) {
				roles.data[x].email = c.email;
				RolesCollection.update(r_id, roles.data[x]);
			}
		}
		for (var x in roleLabels.data) {
			RoleLabelsCollection.insert(importHelper_transformRoleLabel(roleLabels.data[x]));
		}

		// get skills also

		var response = HTTP.call( 'GET', skillsCellFeed );
		console.log(response);
		var result = processSkillsJson(response.data);
		if (result && result.length > 0) {
			result.forEach(s => { SkillsCollection.insert(s) });
			console.log("Successfully imported " + result.length + " skill entries.");
		} else {
			console.error("Could not find any skills!");
		}
	}
});