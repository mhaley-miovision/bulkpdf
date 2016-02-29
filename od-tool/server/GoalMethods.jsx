Meteor.methods({
	"teal.goals.addGoal": function(text) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var goal = GoalsCollection.insert({
			description: text,
			createdAt: new Date(),
			owner: Meteor.user()._id,
			username: Meteor.user().profile.name
		});

		return goal; // to retrieve the ID
	},

	"teal.goals.removeGoal": function(goalId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.remove(goalId);
	},

	// note: this function recurses up the goal tree
	"teal.goals.updateGoalStats": function (goalId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// get the goal
		let g = GoalsCollection.findOne({_id:goalId});

		// get the children of this goal
		let children = GoalsCollection.find({parent:goalId}).fetch();
		let completed = 0;
		let inProgress = 0;
		let notStarted = 0;
		if (children.length > 0) {
			children.forEach(c => {
				console.log(c.stats);
				console.log(c._id);

				// count the child subgoal states
				completed += c.stats.completed;
				inProgress += c.stats.inProgress;
				notStarted += c.stats.notStarted;

				// also count the child goal state
				if (c.state == 0) {
					notStarted++;
				} else if (c.state == 1) {
					inProgress++;
				} else {
					completed++;
				}
			});
		}
		// update the goal
		GoalsCollection.update(goalId, {
			$set: {
				stats: {
					completed: completed,
					inProgress: inProgress,
					notStarted: notStarted
				}
			}
		});

		// recurse upwards!
		if (g.parent) {
			Meteor.call("teal.goals.updateGoalStats", g.parent);
		}
	},

	// this is a pretty ugly method, but it should do the trick for now
	"teal.goals.setGoalState": function (goalId, state) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		if (GoalsCollection.find({parent:goalId}).count() > 0) {
			throw new Meteor.Error("goal-has-children");
		}

		// update the goal
		let g = GoalsCollection.findOne({_id: goalId });
		let prevState = g.state;
		if (state == prevState) {
			return; // no change!
		}
		GoalsCollection.update(g._id, {$set: { state:state, stats: {notStarted: state == 0, inProgress: state == 1, completed: state == 2 } } });

		// determine delta for parents
		var dNotStarted = 0, dInProgress = 0, dCompleted = 0;
		if (prevState == 0) {
			dNotStarted = -1; // one more is now in progress
		} else if (prevState == 1) {
			dInProgress = -1;
		} else {
			dCompleted = -1;
		}
		if (state == 0) {
			dNotStarted++;
		} else if (state == 1) {
			dInProgress++;
		} else {
			dCompleted++;
		}

		// apply the diff
		GoalsCollection.update(
			{ _id : { $in : g.path } },
			{ $inc: { "stats.notStarted" : dNotStarted, "stats.inProgress" : dInProgress, "stats.completed" : dCompleted } },
			{ multi:true }
		);
	},

	"teal.goals.setGoalPrivate": function(goalId, setToPrivate) {
		const goal = GoalsCollection.findOne(goalId);

		// Make sure only the task owner can make a task private
		if (goal.owner !== Meteor.user().profile._id) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(goalId, {$set: {private: setToPrivate}});
	},

	"teal.goals.renameGoal": function(goalId, name) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(goalId, {$set: {name: name}});
	},

	"teal.goals.loadGoalTreeForRole": function(roleId = null) {
		//console.log("Goaltree for roleId: '" + roleId + "'");

		if (roleId == null) {
			let currentUser = Meteor.users.findOne({_id: Meteor.userId()});
			roleId = currentUser.primaryRoleId;
			throw new Meteor.error("Couldn't find primary role for current user");
		}
		let topLevelGoals = Meteor.call("teal.goals.getRoleTopLevelGoals", roleId);
		let populatedGoals = [];
		topLevelGoals.forEach(g => {
			populatedGoals.push(Meteor.call("teal.goals.loadGoalTree", g._id));
		});
		return populatedGoals;
	},

	// TODO: filter to this root org
	"teal.goals.loadGoalTree": function(goalId) {
		if (!goalId) {
			throw new Meteor.error("loadGoalTree goalId = null!");
		}

		// get the entire branch
		let goals = GoalsCollection.find({path: goalId}).fetch();

		// append children for tree accessibility
		goals.forEach(g => {
			var children = _.where(goals, {parent: goalId});
			g.children = children;
		});

		// return the root
		return _.where(goals, {_id: goalId});
	},

	"teal.goals.setKeyObjective": function(keyObjectiveId, isCompleted) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(
			{ "keyObjectives._id" : keyObjectiveId} ,
			{ $set: { "keyObjectives.$.completed" : isCompleted } });
	},

	"teal.goals.setDoneCriterion": function(doneCriterionId, isCompleted) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		GoalsCollection.update(
			{ "doneCriteria._id" : doneCriterionId} ,
			{ $set: { "doneCriteria.$.completed" : isCompleted } });
	},

	"teal.goals.updateContributorTopLevelGoals": function(contributorId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		// find all nodes with this contributor as owner or contributor, sorted by depth
		let goals = GoalsCollection.find(
			{$or: [ {owners: contributorId}, {contributors: contributorId} ]},
			{sort: {depth:1}, fields: { _id: 1, path: 1}}).fetch();

		// remove all nodes which are sub-children
		let i = 0;
		while (i < goals.length) {
			let g = goals[i];

			// disallow root goals
			if (g.depth === 0) {
				goals.splice(j, 1);
				continue;
			}

			// remove all sub children, i.e. that contain this id in their path
			let j = i+1;
			while (j < goals.length) {
				if (goals[j].path.indexOf(g._id) >= 0) {
					goals.splice(j, 1);
				} else {
					j++; // only increment if we didn't remove the element
				}
			}
			// next top level node
			i++;
		}

		let goalIds = goals.map(g => { return g._id });
		ContributorsCollection.update(contributorId, {$set: { topGoals: goalIds }});
	},

	"teal.goals.getRoleTopLevelGoals": function(roleId) {
		// find all nodes with this role as owner or contributor, sorted by depth
		let goals = GoalsCollection.find(
			{$or: [{ownerRoles: {$elemMatch: {_id: roleId}}}, {contributorRoles: {$elemMatch: {_id: roleId}}}]},
			{sort: {depth: 1}, fields: {_id: 1, path: 1}}).fetch();

		// remove all nodes which are sub-children
		let i = 0;
		while (i < goals.length) {
			let g = goals[i];

			// disallow root goals
			if (g.depth === 0) {
				goals.splice(j, 1);
				continue;
			}

			// remove all sub children, i.e. that contain this id in their path
			let j = i + 1;
			while (j < goals.length) {
				if (goals[j].path.indexOf(g._id) >= 0) {
					goals.splice(j, 1);
				} else {
					j++; // only increment if we didn't remove the element
				}
			}
			// next top level node
			i++;
		}

		return goals;
	},

	"teal.goals.updateRoleTopLevelGoals": function(roleId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		let goals = Meteor.call("teal.goals.getRoleTopLevelGoals", roleId);

		let goalIds = goals.map(g => { return g._id });
		RolesCollection.update(roleId, {$set: { topGoals: goalIds }});
	},

	"teal.goals.updateOrInsertGoal": function(goalId, goalParentId, name, keyObjectives,
											  doneCriteria, ownerRoles, contributorRoles,
											  state, estimatedCompletionOn) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		let newGoal = false;
		let g = goalId ? GoalsCollection.findOne({_id:goalId}) : null;
		if (!g) {
			g = {}; // new goal!
			newGoal = true;
		}
		g.name = name;
		g.keyObjectives = keyObjectives;
		g.doneCriteria = doneCriteria;
		g.ownerRoles = ownerRoles;
		g.contributorRoles = contributorRoles;
		g.state = state;
		g.estimatedCompletionOn = estimatedCompletionOn;

		let _id = null; // either new or existing

		if (newGoal) {
			// build path to this node
			let p = null;
			if (goalParentId) {
				p = GoalsCollection.findOne({_id: goalParentId});
				GoalsCollection.update({_id: goalParentId}, {$set: {isLeaf:false}}); // no longer a leaf
				g.path = _.clone(p.path);
				g.path.push(p._id);
				g.depth = p.depth + 1;
				g.rootOrgId = p.rootOrgId;
				g.rootGoalName = p.rootGoalName;
				g.rootGoalId = p.rootGoalId;
				g.parent = goalParentId; // attach to parent
				g.isLeaf = true;
				g.stats = { notStarted: 0, inProgress: 0, completed: 0 };
			}

			// actually insert the goal
			_id = GoalsCollection.insert(g);

			// populate role goal stats
			ownerRoles.forEach(r => {
				Meteor.call("teal.goals.updateContributorTopLevelGoals", r._id);
			});
			contributorRoles.forEach(r => {
				Meteor.call("teal.goals.updateContributorTopLevelGoals", r._id);
			});

		} else {
			_id = g._id;
			if (goalParentId != null) {
				console.error("moving around goal branches around not yet supported!")
			} else {
				GoalsCollection.update(goalId, g);
			}
		}
		// update goal stats
		Meteor.call("teal.goals.updateGoalStats", _id);
	},

	"teal.goals.deleteGoal" : function(goalId) {
		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		let g = GoalsCollection.findOne({_id:goalId});
		if (g) {
			if (g.isLeaf) {
				GoalsCollection.remove({_id:goalId});

				// update parent stats
				let p = GoalsCollection.findOne({ _id: g.parent });
				if (p) {
					let numChildren = GoalsCollection.find({parent: p._id}).count();
					if (numChildren == 0) {
						GoalsCollection.update(p._id, {$set: {isLeaf: true}});
					}
					Meteor.call("teal.goals.updateGoalStats", p._id);
				} else {
					throw new Meteor.Error("failed to find parent of recently deleted goal! id = " + g.parent);
				}
			} else {
				throw new Meteor.Error("not-allowed");
			}
		} else {
			throw new Meteor.Error("not-found");
		}
	}
});

Meteor.startup(function() {
	GoalsCollection._ensureIndex({"keyObjectives._id": 1}, {unique: false});
	GoalsCollection._ensureIndex({"doneCriteria._id": 1}, {unique: false});
});