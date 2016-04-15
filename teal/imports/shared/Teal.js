import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

var Teal = {
	toast: function(msg) {
		Materialize.toast(msg, 3000);
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

	// What to show when org is undefined
	UndefinedRootOrganization: 'no_root_organization',

	// The date format to use throughout Teal
	DateFormat: "YYYY-MM-DD",

	// The date format to use throughout Teal
	DateTimeFormat: "lll",

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

	getRoleContributorAsString(contributor) {
		return contributor ? contributor : "unassigned";
	},

	currentUserEmail() {
		if (!!Meteor.user().email) {
			return Meteor.user().email;
		} else {
			throw new Meteor.Error("current-user-email-not-found");
		}
	},

	userPhotoUrl(photoUrl) {
		if (!!photoUrl) {
			return photoUrl;
		}
		return '/img/user_avatar_blank.jpg';
	},

	// Create a new timestamp
	newDateTime() {
		return new Date(); // moment(Meteor.call("teal.getServerDate")).format(Teal.DateTimeFormat);
	},

	// Create a new ID
	newId() {
		return new Mongo.Collection.ObjectID()._str;
	},

	// Retrieves the current root org id, based on the logged in user
	rootOrgId() {
		if (!!Meteor.user()) {
			return Meteor.user().rootOrgId;
		} else {
			console.warn("Teal.UndefinedRootOrganization was resolved!");
			return Teal.UndefinedRootOrganization; // do not return null in case it enables matching all queries
		}
	},

	//TODO: put this in api
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
		return this.isSmall() ? output : '';
	},
	whenNotSmall(output) {
		return this.isSmall() ? '' : output;
	}
};

export default Teal;
