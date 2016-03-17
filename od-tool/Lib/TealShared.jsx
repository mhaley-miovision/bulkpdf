Teal = {
	// These are what types of changes we track and approve/reject/apply throughout the system
	// They operate on the basic basic building blocks of the organizational model
	ChangeTypes: {

		// Role operations
		NewRole:'new_role',
		NewRoleAccountability:'new_accountability',
		RemoveRoleAccountability:'remove_accountability',
		RemoveRole:'remove_role',
		AssignRoleContributor:'assign_role_contributor',
		RemoveRoleContributor:'remove_role_contributor',
		UpdateRole:'update_role',

		// Role label operations
		NewRoleLabel:'add_role_label',
		RenameRoleLabel:'rename_role_label',
		RemoveRoleLabel:'remove_role_label',

		// Organization operations
		NewOrganization:'new_organization',
		RemoveOrganization:'remove_organization',
		MoveOrganization:'move_organization', // the concept of promoting or demoting is implied here
		UpdateOrganization:'update_organization',

		// Goal operations
		NewGoal:'new_goal',
		AssignRoleGoal:'assign_role_goal',
		RemoveGoal:'remove_goal',
		RemoveRoleGoal:'remove_role_goal',
		UpdateGoal:'update_goal',
		UpdateGoalProgress:'update_goal_progress', // things like checking off done criteria and key objectives
	},

	ObjectTypes: {
		Goal:'goal',
		Role:'role',
		RoleLabel:'role_label',
		Contributor:'contributor',
		Organization:'organization',
		Accountability:'accountability',
	},

	ApplyTypes: {
		Request:'request',
		Immediate:'immediate',
	},

	getGoalAsString(goal) {
	},

	//TODO: this should be a method on a goal class
	getGoalReadableState(state) {
		if (state == 0) {
			return 'Not Started'
		} else if (state == 1) {
			return 'In Progress'
		} else if (state == 2) {
			return 'Completed';
		}
		return ''; // unknown state
	},

	getCheckableItemState(state) {
		return state ? "Done" : "Not Done";
	},

	currentUserEmail() {
		return Meteor.user().email;
	},

	// Each business rule can assume the following context
	// user = Acting user
	// operation = Activity to perform

	// Business rules
	_businessRules: [],

	// Initialize the business rules around object changes
	// A business rule can either resolve or not
	// If unresolved, continue the search

	Errors: {
		InvalidBusinessRuleCall: 'invalid-business-rule-call',
	},

	_initializeBusinessRules() {

		//TODO: implement this

		// Business rules for goals

		// If the user is an owner, the goal can be added immediately, else it's a request
		Teal._businessRules.push({
				type: Teal.ChangeTypes.NewGoal,
				func: function(user, parameters) {
					if (!!parameters.parentGoal) {
						// user is an owner
						if (_.where(g.ownerRoles, {email:user.email})) {
							return Teal.ActionType.Immediate;
						} else {
							return Teal.ActionType.Request;
						}
					} else {
						throw new Meteor.error(Teal.Errors.InvalidBusinessRuleCall);
					}
				}
			});

		// If the user is an owner, the goal can be added immediately
		Teal._businessRules.push({
			type: Teal.ChangeTypes.AssignRoleContributor,
			func: function(user, parameters) {
				if (!!parameters.parentGoal) {
					if (g.ownerRoles) {

					}
				} else {
					throw new Meteor.error(Teal.Errors.InvalidBusinessRuleCall);
				}
			}
		});
	},

	// Resolve action type - immediate application or request
	// Returns a target ActionType object
	determineActionType(user, operation, parameters) {
		//TODO: implement this
	},

	// What to show when org is undefined
	UndefinedRootOrganization: 'no_root_organization',

	// The date format to use throughout Teal
	DateFormat: "YYYY-MM-DD",

	// The date format to use throughout Teal
	DateTimeFormat: "lll",

	// Create a new timestamp
	newDateTime() {
		return new Date(); // moment(Meteor.call("teal.getServerDate")).format(Teal.DateTimeFormat);
	},

	// Create a new ID
	newId() {
		return new Mongo.Collection.ObjectID()._str;
	},

	// Retrieves the current root org id, based on the logged in user
	rootOrgIg() {
		if (!!Meteor.user()) {
			return Meteor.user().rootOrgId;
		} else {
			console.error("Teal.UndefinedRootOrganization was resolved!");
			return Teal.UndefinedRootOrganization; // do not return null in case it enables matching all queries
		}
	},

	// Is this a valid change type?
	isAllowedChangeType(changeType) {
		return _.indexOf(_.values(Teal.ChangeTypes), changeType) >= 0;
	},

	// Return the list of lead nodes for this organization, for this user
	getLeadNodeRoleForUser(orgId, userId) {
		if (!Meteor.userId) {
			throw new Meteor.Error("not-allowed");
		}
		if (typeof(userId) === 'undefined') {
			userId = Meteor.userId();

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

	// mobile haxxor section - TODO: do this better!
	isSmall() {
		return screen.width < 700;
	},
	whenSmall(output) {
		return Teal.isSmall() ? output : '';
	},
	whenNotSmall(output) {
		return Teal.isSmall() ? '' : output;
	},
};

Meteor.startup(function() {
	Teal._initializeBusinessRules();
});