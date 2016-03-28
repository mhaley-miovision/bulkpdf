// globals for this file
let rootOrgName = "Miovision";
let rootOrgId = "miovision-root";
let MAX_ROW_COUNT = 2000;

function importHelper_transformApplication(x) {
	x.type = 'application';
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformOrganization(x) {
	x.type = Teal.ObjectTypes.Organization;
	x.name = x.name.trim();
	x.createdAt  = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.path = [];
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformRole(x) {
	x.type = Teal.ObjectTypes.Role;
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	x.primaryAccountability = x.primaryAccountability === 'TRUE';
	return x;
}
function importHelper_transformOrgAccountability(x) {
	x.type = Teal.ObjectTypes.Accountability;
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformJobAccountability(x, id) {
	x.id = id;
	x.type = Teal.ObjectTypes.Accountability;
	x.createdAt = Teal.newDateTime();
	x.createdBy = Meteor.userId;
	x.rootOrgId = rootOrgId;
	return x;
}
function importHelper_transformContributor(x) {
	x.type = Teal.ObjectTypes.Contributor;
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
	x.type = Teal.ObjectTypes.RoleLabel;
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
function parseSkills(sheedFeedUrl) {
	var input = HTTP.call('GET', sheedFeedUrl);
	var res = [];
	for (var e in input.data.feed.entry) {
		var o = input.data.feed.entry[e];
		res[o.title.$t] = o.content.$t;
	}
	var c = res;

	var startRow = 1;
	var blankRowCount = 0;
	var r = startRow;

	var skills = [];

	while (r++ < MAX_ROW_COUNT) {
		// stop if exceeded blank row count
		if (typeof(c["B"+r]) === 'undefined') {
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
function parseAccountabilities(sheedFeedUrl) {
	var input = HTTP.call('GET', sheedFeedUrl);
	var res = [];
	for (var e in input.data.feed.entry) {
		var o = input.data.feed.entry[e];
		res[o.title.$t] = o.content.$t;
	}
	var c = res;

	var startRow = 1;
	var blankRowCount = 0;
	var r = startRow;
	var accountabilities = [];

	while (r++ < MAX_ROW_COUNT) {
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
function parseRoles(sheedFeedUrl) {
	var input = HTTP.call('GET', sheedFeedUrl);
	var res = [];
	for (var e in input.data.feed.entry) {
		var o = input.data.feed.entry[e];
		res[o.title.$t] = o.content.$t;
	}
	var c = res;

	var startRow = 1;
	var blankRowCount = 0;
	var r = startRow;
	var roles = [];

	while (r++ < MAX_ROW_COUNT) {
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
//======================================================================================================================
// ORGANIZATIONS
//======================================================================================================================
function parseOrganizations(sheedFeedUrl) {
	var input = HTTP.call('GET', sheedFeedUrl);
	var res = [];
	for (var e in input.data.feed.entry) {
		var o = input.data.feed.entry[e];
		res[o.title.$t] = o.content.$t;
	}
	var c = res;

	var startRow = 1;
	var blankRowCount = 0;
	var r = startRow;
	var organizations = [];

	while (r++ < MAX_ROW_COUNT) {
		// stop if exceeded blank row count
		if (typeof(c["B"+r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}
		organizations.push({
			name : sanitizeCell(res['B'+r]),
			parent : sanitizeCell(res['C'+r]),
			startDate : sanitizeCell(res['H'+r]),
			endDate : sanitizeCell(res['I'+r]),
		});
	}
	return organizations;
}
//======================================================================================================================
// CONTRIBUTORS
//======================================================================================================================
function parseContributors(sheedFeedUrl) {
	var input = HTTP.call('GET', sheedFeedUrl);
	var res = [];

	for (var e in input.data.feed.entry) {
		var o = input.data.feed.entry[e];
		res[o.title.$t] = o.content.$t;
	}
	var c = res;

	var startRow = 1;
	var blankRowCount = 0;
	var r = startRow;
	var contributors = [];

	while (r++ < MAX_ROW_COUNT) {
		// stop if exceeded blank row count
		if (typeof(c["B"+r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}
		contributors.push({
			lastName : sanitizeCell(res['B'+r]),
			firstName : sanitizeCell(res['C'+r]),
			name : sanitizeCell(res['D'+r]),
			isActive : sanitizeCell(res['E'+r]),
			startDate : sanitizeCell(res['F'+r]),
			endDate : sanitizeCell(res['G'+r]),
			email : sanitizeCell(res['H'+r]),
			physicalTeam : sanitizeCell(res['I'+r]),
			employeeStatus : sanitizeCell(res['J'+r])
		});
	}
	return contributors;
}

function readSheetFeedUrls(sheedFeedUrl) {
	// Use API to retrieve OD datavar response = HTTP.call('GET', accountabilitiesCellFeed);
	var input = HTTP.call('GET', sheedFeedUrl);
	let cellsFeedLookup = [];
	var parsed = JSON.parse(input.content);
	var x = _.map(parsed.feed.entry,
		function(x) {
			return {
				title: x.title.$t,
				cellsFeedUrl: ( _.find(x.link, function (y) { return y.rel.indexOf('#cellsfeed') >= 0; }).href + "?alt=json" )
			};
		});
	_.each(x, function(z) { cellsFeedLookup[z.title.toLowerCase()] = z.cellsFeedUrl; });
	return cellsFeedLookup;
}

//======================================================================================================================
// ROLE LABELS
//======================================================================================================================
function parseRoleLabels(sheedFeedUrl) {
	var input = HTTP.call('GET', sheedFeedUrl);
	var res = [];
	for (var e in input.data.feed.entry) {
		var o = input.data.feed.entry[e];
		res[o.title.$t] = o.content.$t;
	}
	var c = res;

	var startRow = 1;
	var blankRowCount = 0;
	var r = startRow;
	var roleLabels = [];

	while (r++ < MAX_ROW_COUNT) {
		// stop if exceeded blank row count
		if (typeof(c["B"+r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}
		roleLabels.push({
			name : sanitizeCell(res['B'+r])
		});
	}
	return roleLabels;
}

Meteor.methods({
	"teal.import.importGoogleSpreadsheetDatabase": function () {
		//TODO: make this a parameter
		var sheedFeedUrl = "https://spreadsheets.google.com/feeds/worksheets/1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ/public/basic?alt=json";

		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

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
		let cellsFeedLookup = readSheetFeedUrls(sheedFeedUrl);

		//==============================================================================================================
		// Organizations
		//==============================================================================================================

		var organizations = parseOrganizations(cellsFeedLookup['organizations']);

		// organization import
		for (var x in organizations) {
			// do not re-insert root org
			if (organizations[x].name !== rootOrgName) {
				OrganizationsCollection.insert(importHelper_transformOrganization(organizations[x]));
			}
		}
		console.log("Imported " + organizations.length + " organizations.");

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

		var contributors = parseContributors(cellsFeedLookup['contributors']);
		contributors.forEach(x => {
			let processed = importHelper_transformContributor(x);
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
		});

		// overwrite contributor link
		// WARNING: assumes to name collisions within same root org id
		Meteor.users.find({rootOrgId:rootOrgId}).forEach(u => {
			var c = ContributorsCollection.findOne( { email: u.email });
			Meteor.users.update( {email: u.email}, {$set: {contributorId: c._id}}, {multi:true} );
		});

		console.log("Imported " + contributors.length + " contributors.");

		//==============================================================================================================
		// Roles
		//==============================================================================================================

		var roles = parseRoles(cellsFeedLookup['jobs']);
		roles.forEach(r => {
			var processed = importHelper_transformRole(r);
			processed.rootOrgId = rootOrgId;

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
				let path = _.clone(org.path);
				path.push(org._id); // full path includes this org as a parent
				processed.path = path;
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
		console.log("Imported " + roles.length + " roles.");

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

		var accountabilities = parseAccountabilities(cellsFeedLookup['job accountabilities']);

		// attach to corresponding roles
		RolesCollection.find({rootOrgId:rootOrgId}).forEach(r => {

			// find the accountabilities that belong
			let roleAccountabilities = [];

			let accs = _.where(accountabilities, { jobId: r._oldId });
			if (accs.length > 0) {
				accs.forEach(a => {
					roleAccountabilities.push({
						_id: Teal.newId(),
						name: a.acc,
						accountabilityType: a.type,
					});
				});
			}

			// apply them to the role, and unset the old id
			RolesCollection.update(r._id, {$set: { accountabilities: roleAccountabilities }});
			RolesCollection.update(r._id, {$unset: { _oldId: 1 }});

			if (accs.length > 0) {
				console.log("Successfully attached " + accs.length + " accountabilities to role " + r.accountabilityLabel);
			}
		});
		console.log("Imported " + accountabilities.length + " accountabilities.");

		//==============================================================================================================
		// Role Labels
		//==============================================================================================================

		var roleLabels = parseRoleLabels(cellsFeedLookup['roles']);
		roleLabels.forEach(rl => {
			RoleLabelsCollection.insert(importHelper_transformRoleLabel(rl));
		});
		console.log("Imported " + roleLabels.length + " role labels.");

		//==============================================================================================================
		// Accountability Labels
		//==============================================================================================================

		let levels = ['Part Time','Coop', 'Junior', 'Intermediate', 'Senior', 'Director', 'Executive'];
		AccountabilityLevelsCollection.remove({});
		levels.forEach(l => {
			AccountabilityLevelsCollection.insert({name:l, rootOrgId:rootOrgId});
		});
		console.log("Imported " + levels.length + " accountability levels.");

		//==============================================================================================================
		// Skills
		//==============================================================================================================

		// get skills also, bypassing v1 of tool
		var skills = parseSkills(cellsFeedLookup['skills']);
		skills.forEach(s => {
			s.rootOrgId = rootOrgId;
			SkillsCollection.insert(s)
		});
		console.log("Imported " + skills.length + " skills.");
	}
})

