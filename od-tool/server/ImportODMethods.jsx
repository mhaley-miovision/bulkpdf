// globals for this file
let rootOrgName = "Miovision";
let rootOrgId = "miovision-root";

function importHelper_transformApplication(x) {
	x.type = 'application';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformOrganization(x) {
	x.type = "organization";
	x.name = x.name.trim();
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformRole(x) {
	x.type = 'role';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformOrgAccountability(x) {
	x.type = 'org_accountability';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformJobAccountability(x, id) {
	x.id = id;
	x.type = 'role_accountability';
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
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
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformRoleLabel(x) {
	x.type = 'role_label';
	x.name = x.name.trim();
	x.createdAt = new Date();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
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
		// stop if exceeded blank row count
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

// TODO: add users upon importing
// TODO: populate ID field references
// TODO: add notion of root org to all objects

Meteor.methods({
	"teal.import.v1ImportDatabase": function() {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var v1BaseURL = "http://ec2-54-152-211-94.compute-1.amazonaws.com/";

		// find the root org if it exists already, and if not, insert it
		var rootOrg = OrganizationsCollection.findOne({name:rootOrgName});
		if (!rootOrg) {
			rootOrgId = OrganizationsCollection.insert({
				_id: "miovision-root",
				type: "organization",
				id: "1",
				name: rootOrgName,
				parent: null,
				isApplication: false,
				startDate: null,
				endDate: null,
				createdAt: new Date(),
				parentId: null,
				path: [],
			});
		} else {
			rootOrgId = rootOrg._id;

			// remove all objects belonging to this org - complete cleanup will occur
			ApplicationsCollection.remove({rootOrgId:rootOrgId});
			ContributorsCollection.remove({rootOrgId:rootOrgId});
			OrganizationsCollection.remove({rootOrgId:rootOrgId});
			OrgAccountabilitiesCollection.remove({rootOrgId:rootOrgId});
			RoleAccountabilitiesCollection.remove({rootOrgId:rootOrgId});
			RolesCollection.remove({rootOrgId:rootOrgId});
			RoleLabelsCollection.remove({rootOrgId:rootOrgId});
			SkillsCollection.remove({rootOrgId:rootOrgId});
		}

		// Use API to retrieve OD data
		var contributors = Meteor.http.call("GET", v1BaseURL + "contributors");
		var roleLabels = Meteor.http.call("GET", v1BaseURL + "roles");
		var applications = Meteor.http.call("GET", v1BaseURL + "applications");
		var jobAccountabilities = Meteor.http.call("GET", v1BaseURL + "jobAccountabilities");
		var organizations = Meteor.http.call("GET", v1BaseURL + "organizations");
		var orgAccountabilities = Meteor.http.call("GET", v1BaseURL + "orgAccountabilities");
		var roles = Meteor.http.call("GET", v1BaseURL + "jobs");

		//==============================================================================================================
		// Applications
		//==============================================================================================================

		for (var x in applications.data) {
			ApplicationsCollection.insert(importHelper_transformApplication(applications.data[x]));
		}

		//==============================================================================================================
		// Organizations
		//==============================================================================================================

		// organization import
		for (var x in organizations.data) {
			// do not re-insert root org
			if (organizations.data[x] !== rootOrgName) {
				OrganizationsCollection.insert(importHelper_transformOrganization(organizations.data[x]));
			}
		}

		OrganizationsCollection.find({rootOrgId:rootOrgId}).forEach(org => {
			// find the parent chain
			var o = OrganizationsCollection.findOne({name: org.name});
			var parentId = null;
			var path = [];
			while (o.parent) {
				var p = OrganizationsCollection.findOne({name: o.parent});
				parentId = p._id;
				path.push(parentId);
				o = p; // traverse upwards
			}
			path.reverse();

			OrganizationsCollection.update(org._id, {$set : { parentId:parentId, path:path }});
		});


		//==============================================================================================================
		// Contributors
		//==============================================================================================================

		for (var x in contributors.data) {
			var c_id = ContributorsCollection.insert(importHelper_transformContributor(contributors.data[x]));
			var c = ContributorsCollection.findOne({_id:c_id});

			// also add to the users table, with appropriate roles
			var existing = Meteor.users.findOne({email: c.email});
			var userId = null;
			if (!existing) {
				userId = Meteor.users.insert({
					email: c.email,
					profile: { name: c.name }
				});
			} else {
				userId = existing._id;
			}

			// attach Teal-specific user information
			Meteor.users.update(userId, {$set: {rootOrgId:rootOrgId, contributorId:c_id}});

			// look up actual id instead of name
			let o = OrganizationsCollection.findOne({name: c.physicalTeam});
			if (o) {
			ContributorsCollection.update(c_id,{$set:{physicalOrgId: o._id}});
			} else {
				console.error("Couldn't find physical team for: " + c.name);
			}

			// enabled users
			var enabledUsers = ['vleipnik@miovision.com','leipnik@gmail.com','jreeve@miovision.com',
				'jwincey@miovision.com', 'jbhavnani@miovision.com','lgreig@miovision.com','kmcbride@miovision.com',
				'tbrijpaul@miovision.com', 'ndumond@miovision.com','dbullock@miovision.com','bward@miovision.com',
				'bpeters@miovision.com','jbarr@miovision.com'];
			if (enabledUsers.indexOf(c.email) >= 0) {
				Roles.addUsersToRoles(userId, 'enabledUser'); //TODO:fix groups to work properly , rootOrgId);
			}

			// admins
			var adminUsers = ['vleipnik@miovision.com','jreeve@miovision.com',
				'jwincey@miovision.com', 'jbhavnani@miovision.com','lgreig@miovision.com','kmcbride@miovision.com',
				'tbrijpaul@miovision.com', 'ndumond@miovision.com','dbullock@miovision.com','bward@miovision.com',
				'bpeters@miovision.com'];
			if (adminUsers.indexOf(c.email) >= 0) {
				Roles.addUsersToRoles(userId, 'admin'); //TODO:fix groups to work properly , rootOrgId);
			}
		}

		//==============================================================================================================
		// Org Accountabilities
		//==============================================================================================================

		for (var x in orgAccountabilities.data) {
			OrgAccountabilitiesCollection.insert(importHelper_transformOrgAccountability(orgAccountabilities.data[x]));
		}

		//==============================================================================================================
		// Role Accountabilities
		//==============================================================================================================

		for (var x in jobAccountabilities.data) {
			RoleAccountabilitiesCollection.insert(importHelper_transformJobAccountability(jobAccountabilities.data[x], x));
		}

		//==============================================================================================================
		// Roles
		//==============================================================================================================

		for (var x in roles.data) {
			var r_id = RolesCollection.insert(importHelper_transformRole(roles.data[x]));

			// append user email
			var c = ContributorsCollection.findOne({name:roles.data[x].contributor});
			if (c) {
				RolesCollection.update(r_id, {$set: { email: c.email }});
			}

			// append org path (for easy role querying)
			var path = [];
			var org = OrganizationsCollection.findOne({name:roles.data[x].organization});
			if (org) {
				path = org.path;
			}
			RolesCollection.update(r_id, {$set: { orgPath: path }});
		}

		//==============================================================================================================
		// Role Labels
		//==============================================================================================================

		for (var x in roleLabels.data) {
			RoleLabelsCollection.insert(importHelper_transformRoleLabel(roleLabels.data[x]));
		}

		//==============================================================================================================
		// Skills
		//==============================================================================================================

		// get skills also, bypassing v1 of tool
		var response = HTTP.call( 'GET', skillsCellFeed );
		var result = processSkillsJson(response.data);
		if (result && result.length > 0) {
			result.forEach(s => { SkillsCollection.insert(s) });
			console.log("Successfully imported " + result.length + " skill entries.");
		} else {
			console.error("Could not find any skills!");
		}
	}
});