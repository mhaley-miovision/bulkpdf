// globals for this file
let rootOrgName = "Miovision";
let rootOrgId = "miovision-root";

function importHelper_transformApplication(x) {
	x.type = 'application';
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformOrganization(x) {
	x.type = "organization";
	x.name = x.name.trim();
	x.createdAt  = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.path = [];
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformRole(x) {
	x.type = 'role';
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	x.primaryAccountability = x.primaryAccountability === 'TRUE';
	return x;
}
function importHelper_transformOrgAccountability(x) {
	x.type = 'org_accountability';
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformJobAccountability(x, id) {
	x.id = id;
	x.type = 'role_accountability';
	x.createdAt = Teal.newDateTime();
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
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformRoleLabel(x) {
	x.type = 'role_label';
	x.name = x.name.trim();
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function sanitizeCell(cellContent) {
	if (cellContent) {
		return cellContent.trim();
	}
	return null;
}
//======================================================================================================================
// SKILLS
//======================================================================================================================
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

		var email = sanitizeCell(res['C'+r]);
		var skill = sanitizeCell(res['D'+r]);
		var rating = sanitizeCell(res['E'+r]);
		skills.push({email:email, skill:skill, rating:rating });
	}

	return skills;
}
//======================================================================================================================
// ACCOUNTABILITIES
//======================================================================================================================
var url = "https://spreadsheets.google.com/feeds/worksheets/1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ/public/basic?alt=json";
var accountabilitiesCellFeed = "https://spreadsheets.google.com/feeds/cells/1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ/o4k261s/public/basic?alt=json";
function processAccountabilitiesJson(json) {
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

	var accountabilities = [];

	while (r++ < 2000) {
		// stop if exceeded blank row count
		if (typeof(c["C"+r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}
		accountabilities.push({
			job : sanitizeCell(res['B'+r]),
			jobId : sanitizeCell(res['C'+r]),
			contrib : sanitizeCell(res['D'+r]),
			acc : sanitizeCell(res['E'+r]),
			app : sanitizeCell(res['F'+r]),
			rating : sanitizeCell(res['G'+r]),
			type : sanitizeCell(res['H'+r]),
		});
	}
	return accountabilities;
}
//======================================================================================================================
// ROLES
//======================================================================================================================
var rolesCellFeed = "https://spreadsheets.google.com/feeds/cells/1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ/oz844tv/public/basic?alt=json";
function processRolesJson(json) {
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

	var roles = [];

	while (r++ < 2000) {
		// stop if exceeded blank row count
		if (typeof(c["C" + r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}

		let role = {
			label: sanitizeCell(res['A' + r]),
			accountabilityLabel: sanitizeCell(res['B' + r]),
			organization: sanitizeCell(res['D' + r]),
			application: sanitizeCell(res['E' + r]),
			accountabilityLevel: sanitizeCell(res['F' + r]),
			contributor: sanitizeCell(res['G' + r]),
			primaryAccountability: sanitizeCell(res['H' + r]),
			isActive: sanitizeCell(res['I' + r]),
			startDate: sanitizeCell(res['O' + r]),
			endDate: sanitizeCell(res['P' + r]),
			isExternal: sanitizeCell(res['Q' + r]),
			isLeadNode: sanitizeCell(res['R' + r]) === 'TRUE',
			_oldId: sanitizeCell(res['C' + r]),
		};
		roles.push(role);
	}

	return roles;
}

Meteor.methods({
	"teal.import.v1ImportDatabase": function () {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var v1BaseURL = "http://ec2-54-152-211-94.compute-1.amazonaws.com/";

		// find the root org if it exists already, and if not, insert it
		var rootOrg = OrganizationsCollection.findOne({name: rootOrgName});
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
			ApplicationsCollection.remove({rootOrgId: rootOrgId});
			ContributorsCollection.remove({rootOrgId: rootOrgId});
			OrganizationsCollection.remove({rootOrgId: rootOrgId});
			OrgAccountabilitiesCollection.remove({rootOrgId: rootOrgId});
			RoleAccountabilitiesCollection.remove({rootOrgId: rootOrgId});
			RolesCollection.remove({rootOrgId: rootOrgId});
			RoleLabelsCollection.remove({rootOrgId: rootOrgId});
			SkillsCollection.remove({rootOrgId: rootOrgId});
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

		OrganizationsCollection.find({rootOrgId: rootOrgId}).forEach(o => {
			var p = OrganizationsCollection.findOne({name: o.parent});
			if (!p) {
				console.log("no parent found for organization: " + o.name);
			} else {
				OrganizationsCollection.update(o._id, {$set: {parentId: p._id}});
			}
		});

		OrganizationsCollection.find({rootOrgId: rootOrgId}).forEach(o => {
			Meteor.call("teal.orgs.updateCachedOrgValues", o._id);
		});

		//==============================================================================================================
		// Contributors
		//==============================================================================================================

		for (let x in contributors.data) {
			let processed = importHelper_transformContributor(contributors.data[x]);

			// insert the contributor
			var c_id = ContributorsCollection.insert(processed);
			var c = ContributorsCollection.findOne({_id: c_id});

			// look up actual id instead of name
			let o = OrganizationsCollection.findOne({name: c.physicalTeam});
			if (o) {
				ContributorsCollection.update(c_id, {$set: {physicalOrgId: o._id}});
			} else {
				console.warn("Couldn't find physical team for: " + c.name);
			}
		}

		//==============================================================================================================
		// Org Accountabilities
		//==============================================================================================================

		for (var x in orgAccountabilities.data) {
			OrgAccountabilitiesCollection.insert(importHelper_transformOrgAccountability(orgAccountabilities.data[x]));
		}

		//==============================================================================================================
		// Roles
		//==============================================================================================================

		// get skills also, bypassing v1 of tool
		var response = HTTP.call('GET', rolesCellFeed);
		var result = processRolesJson(response.data);
		if (result && result.length > 0) {
			result.forEach(r => {
				var processed = importHelper_transformRole(r);

				// user info
				var c = ContributorsCollection.findOne({name: processed.contributor});
				if (c) {
					processed.email = c.email;
					processed.contributorId = c._id;
				} else {
					console.error("Couldn't find contributor for role: " + processed.accountabilityLabel);
				}

				// organization info
				var org = OrganizationsCollection.findOne({name: r.organization});
				if (org) {
					path = _.clone(org.path);
					path.push(org._id); // full path includes this org as a parent
					processed.path = path
					processed.organizationId = org._id;
				} else {
					console.error("Couldn't find organization for role: " + processed.accountabilityLabel);
				}

				// finally insert  the role
				var r_id = RolesCollection.insert(processed);

				// append primary role id to contributor
				if (c && r.primaryAccountability) {
					ContributorsCollection.update({_id: c._id}, {$set: {primaryRoleId: r_id}});
				}
			});
			console.log("Successfully imported " + result.length + " role entries.");
		} else {
			console.error("Could not find any roles!");
		}

		// any contributor without a primary role identified can be filled in automatically
		ContributorsCollection.find({primaryRoleId: {$exists: false}}).forEach(c => {
			// if there is a single matching role, default it to the primary one
			var roles = RolesCollection.find({email: c.email}).fetch();
			if (roles.length == 1) {
				ContributorsCollection.update({_id: c._id}, {$set: {primaryRoleId: roles[0]._id}});
				RolesCollection.update(roles[0]._id, {$set: {primaryAccountability : true}});
			} else {
				console.warn("Could not decide on primary role for contributor: " + c.email);
			}
		});


		//==============================================================================================================
		// Role Accountabilities
		//==============================================================================================================

		//TODO: remove this
		for (var x in jobAccountabilities.data) {
			RoleAccountabilitiesCollection.insert(importHelper_transformJobAccountability(jobAccountabilities.data[x], x));
		}

		// get accountabilties, bypassing v1 of tool
		var response = HTTP.call('GET', accountabilitiesCellFeed);
		var result = processAccountabilitiesJson(response.data);
		if (result && result.length > 0) {

			// attach to corresponding roles
			RolesCollection.find({rootOrgId:rootOrgId}).forEach(r => {

				// find the accountabilities that belong
				let accountabilities = [];

				let accs = _.where(result, { jobId: r._oldId });
				if (accs.length > 0) {
					accs.forEach(a => {
						accountabilities.push({
							_id: Teal.newId(),
							name: a.acc,
							accountabilityType: a.type,
						});
					});
				}

				// apply them to the role, and unset the old id
				RolesCollection.update(r._id, {$set: { accountabilities: accountabilities }});
				RolesCollection.update(r._id, {$unset: { _oldId: 1 }});

				if (accs.length > 0) {
					console.log("Successfully attached " + accs.length + " accountabilities to role " + r.accountabilityLabel);
				}
			});
		} else {
			console.error("Could not find any accountabilities!");
		}

		//==============================================================================================================
		// Role Labels
		//==============================================================================================================

		for (var x in roleLabels.data) {
			RoleLabelsCollection.insert(importHelper_transformRoleLabel(roleLabels.data[x]));
		}

		//==============================================================================================================
		// Accountability Labels
		//==============================================================================================================

		let levels = ['Part Time','Coop', 'Junior', 'Intermediate', 'Senior', 'Director', 'Executive'];
		AccountabilityLevelsCollection.remove({});
		levels.forEach(l => {
			AccountabilityLevelsCollection.insert({name:l, rootOrgId:rootOrgId});
		});

		//==============================================================================================================
		// Skills
		//==============================================================================================================

		// get skills also, bypassing v1 of tool
		var response = HTTP.call('GET', skillsCellFeed);
		var result = processSkillsJson(response.data);
		if (result && result.length > 0) {
			result.forEach(s => {
				s.rootOrgId = rootOrgId;
				SkillsCollection.insert(s)
			});
			console.log("Successfully imported " + result.length + " skill entries.");
		} else {
			console.error("Could not find any skills!");
		}
	}
})

