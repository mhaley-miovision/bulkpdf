Teal = {
	ChangeTypes: {
		NewRoleAccountability:'new_accountability',
		RemoveRoleAccountability:'remove_accountability',
		NewRole:'new_role',
		NewOrganization:'new_organization',
		RemoveOrganization:'remove_organization',
		AssignRoleContributor:'assign_role_contributor',
		RemoveRoleContributor:'remove_role_contributor',
		AssignRoleGoal:'assign_role_goal',
		MoveOrganization:'move_organization',
		RemoveRole:'remove_role',
	},

	UndefinedRootOrganization: 'no_root_organization',

	DateFormat: "YYYY-MM-DD",

	rootOrgIg() {
		if (!!Meteor.user()) {
			return Meteor.user().rootOrgId;
		} else {
			return Teal.UndefinedRootOrganization; // do not return null in case it enables matching all queries
		}
	},

	isAllowedChangeType(changeType) {
		return _.find(Object.keys(Teal.ChangeTypes), changeType);
	},

	getLeadNodeRoleForUser(orgId, userId) {
		if (!Meteor.userId) {
			throw new Meteor.Error("not-allowed");
		}
		if (typeof(userId) === 'undefined') {
			userId = Meteor.userId;

			//TODO: temporary backdoor that always answers yes
			if (Meteor.user().email === 'vleipnik@miovision.com') {
				console.log("isLeadNode backdoor activated!")
				let r = RolesCollection.findOne({contributorId:userId, primaryAccountability:true});
				return r;
			}
		}

		// if no org specified, but user specified, return all the roles

		// if any role has a path that contains this org id and the depth of the index is less that or equal to that
		// of the org's depth, i.e. person is a lead node on a parent of or the org itself
		let org = OrganizationsCollection.findOne({_id:orgId});
		if (!!org) {
			// find all roles this person has which are related to this org
			let roles = RolesCollection.find({contributorId:userId, path:orgId, isLeadNode: true});
			roles.forEach(r => {
				if (roles.path.length <= org.path.length) {
					return r;
				}
			});
			return null;
		} else {
			throw new Meteor.Error("not-found");
		}
	},
};