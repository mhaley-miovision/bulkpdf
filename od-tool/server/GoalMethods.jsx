function createOwnerObject(email) {
	var c = ContributorsCollection.findOne({email: email});
	var url = (c && c.photo) ? c.photo : "/img/user_avatar_blank.jpg";
	return { email: email, photo: url };
}

function populateGoalChildren(n, recurse = true) {
	n.children = [];
	// populate photo urls
	for (var i = 0; i < n.owners.length; i++) {
		n.owners[i] = createOwnerObject(n.owners[i]);
	}

	var query = GoalsCollection.find({parent: n._id}); // find the children
	if (query.count() > 0) {
		var r = query.fetch();
		for (var x in r) {
			n.children.push(r[x]); // add the child

			if (recurse) {
				populateGoalChildren(r[x]); // recurse for each child
			}
		}
	}
}

function populateStats(n, recurse = true) {
	if (n.children.length == 0) {
		if (n.status && n.status.toLowerCase() === 'completed') {
			n.stats = { completed:1, inProgress:0, notStarted:0 };
		} else if (n.status && n.status.toLowerCase() === 'in progress') {
			n.stats = { completed:0, inProgress:1, notStarted:0 };
		} else if (n.status && n.status.toLowerCase() === 'not started') {
			n.stats = { completed:0, inProgress:0, notStarted:1 };
		} else {
			console.log("leaf goal node " + n.name + " has undefined status");
			n.stats = { completed:0, inProgress:0, notStarted:0 };
		}
	} else {
		n.stats = { completed:0, inProgress:0, notStarted:0 };

		if (recurse) {
			n.children.forEach(c => populateStats(c));
		}
		n.children.forEach(c => {
				n.stats.completed += c.stats.completed;
				n.stats.inProgress += c.stats.inProgress;
				n.stats.notStarted += c.stats.notStarted;
			}
		);
	}
}

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

	"teal.goals.loadGoalTreeForContributor": function(contributorEmail = null) {
		console.log("Goaltree for: '" + contributorEmail + "'");

		if (contributorEmail == null) {
			var myUser = Meteor.users.findOne({_id: Meteor.userId()});
			contributorEmail = myUser.services.google.email;
		}

		// find all goals with this email attached to them
		let goals = GoalsCollection.find({owners: contributorEmail}).fetch();

		// TODO: this could definitely be optimized
		let isSubgoalOfList = function(n, list) {
			// for each item in the list, see if n is a descendant of that node
			for (l in list) {
				var o = list[l];
				if (o._id !== n._id) {
					// is descendant?
					var p = n;
					while (p.parent) {
						if (p.parent === o._id) {
							return true;
						}
						p = GoalsCollection.findOne({_id: p.parent});
					}
				}
			}
		}

		// find all goals with this email attached to them
		let contributor = ContributorsCollection.findOne({email: contributorEmail});

		if (goals.length == 0) {
			return {
				name: contributor.name + "'s has no goals defined yet.",
				children: [],
				owners: [createOwnerObject(contributorEmail)],
				stats: { completed: 0, inProgress: 0, notStarted: 0 },
			};
		}

		// create a root goal
		let root = {
			name: contributor.name + "'s Goals",
			children: [],
			owners: [createOwnerObject(contributorEmail)]
		};

		// populate tree
		for (var i in goals) {
			if (!isSubgoalOfList(goals[i], goals)) {
				populateGoalChildren(goals[i]);
				root.children.push(goals[i]);
			}
		}
		populateStats(root,false);

		console.log(root);

		return root;
	},

	"teal.goals.loadGoalTree": function(goalId = null) {
		// find the goal or take all root nodes
		var goals = goalId ? GoalsCollection.find({_id: goalId}).fetch()
			: GoalsCollection.find({parent: null}).fetch();

		var root = goals.length > 1 ?
			{ name: "Miovision Goals", children: [], owners: ["kmcbride@miovision.com"] } : goals[0];

		// populate the children
		if (goals.length > 1) {
			for (var idx in goals) {
				var g = goals[idx];
				root.children.push(g);
				g.parent = root;
			}
		}
		populateGoalChildren(root);
		populateStats(root,false);
		return root;
	},
});