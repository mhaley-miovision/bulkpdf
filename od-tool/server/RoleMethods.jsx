Meteor.methods({

	"teal.roles.updateOrInsertRole": function(
		//TODO: consider doing single object versus individual params? read up more on this
		roleId, organizationId, label, accountabilityLevel, contributorId, startDate, endDate,
		isLeadNode, isExternal, isPrimaryAccountability, accountabilities)
	{
		// Make sure the user is logged in before inserting a task
		//TODO: perm check!!!
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// Is there an existing role?
		let newRole = false;
		let role = RolesCollection.findOne({_id:roleId});
		if (!role) {
			role = {};
			newRole = true;
		}

		// set values
		role.label = label;
		role.accountabilityLevel = accountabilityLevel;
		role.contributorId = null; // determine actual id below
		role.startDate = startDate;
		role.endDate = endDate;
		role.isLeadNode = isLeadNode;
		role.isExternal = isExternal;
		role.isPrimaryAccountability = isPrimaryAccountability;
		role.accountabilities = accountabilities;
		role.createdAt = Teal.newDateTime();
		role.createdBy = Meteor.userId();
		role.organizationId = organizationId;
		role.topGoals = [];
		role.type = 'role';

		// cached role values
		//TODO: extract this into a method

		// organization cached info
		if (!!organizationId) {
			var org = OrganizationsCollection.findOne({_id:organizationId});
			if (!org) {
				throw new Meteor.Error("organization-not-found");
			}
			let newPath = _.clone(org.path);
			newPath.push(org._id); // full path includes this org as a parent
			role.path = newPath;

			role.organization = org.name; // TODO: fix finding by org
			role.rootOrgId = org.rootOrgId;

			// accountability label is derived from label + org
			role.accountabilityLabel = role.label + ", " + org.name;
		} else {
			throw new Meteor.Error("missing-organization");
		}
		// contributor cached info
		if (!!contributorId) {
			let contributor = ContributorsCollection.findOne({$or: [ {_id: contributorId}, {email: contributorId} ]});
			if (!contributor) {
				throw new Meteor.Error("contributor-not-found");
			}
			// copy contributor info into the role
			role.contributorId = contributor._id;
			role.contributor = contributor.name;
			role.email = contributor.email;
			role.photo = contributor.photo;
		}

		// update or create!
		if (newRole) {
			let r_id = RolesCollection.insert(role);
			role._id = r_id;
		} else {
			RolesCollection.update(role._id, role);

			// update role cached instances

			// goal caches
			let relatedGoals = GoalsCollection.find(
				{$or: [{ownerRoles: {$elemMatch: {_id: role._id}}}, {contributorRoles: {$elemMatch: {_id: role._id}}}]},
				{fields: {_id: 1}}).fetch();

			// cached version
			let cachedRoleVersion = {
				_id: role._id,
				label: role.label,
				accountabilityLabel: role.accountabilityLabel,
				organizationId: role.organizationId,
				contributor: role.contributor,

			};

			// update the goals (owners and contributors)
			relatedGoals.forEach(g => {
				GoalsCollection.update(
					{ "ownerRoles._id" : role._id} ,
					{ $set: { "ownerRoles.$" : cachedRoleVersion } });
			});
			relatedGoals.forEach(g => {
				GoalsCollection.update(
					{ "contributorRoles._id" : role._id} ,
					{ $set: { "contributorRoles.$" : cachedRoleVersion } });
			});

			// update the role top goals
			Meteor.call("teal.goals.updateRoleTopLevelGoals", role._id);
		}

		console.log("Final role:");
		console.log(role);
	}
});