var key = '1Fzz0qzgqgJP4hnayoxdJqvKwi-UVuPTbp9O1dnkYq2A';
var url = "https://spreadsheets.google.com" + "/feeds/worksheets/" + key + "/public/basic?alt=json";
var cellsFeed = "https://spreadsheets.google.com/feeds/cells/1Fzz0qzgqgJP4hnayoxdJqvKwi-UVuPTbp9O1dnkYq2A/opbzgdu/public/basic?alt=json";

// TODO: ONLY WORKS UNTIL Z RIGHT NOW!!
function incrementColLetter(letter) {
	return String.fromCharCode(letter.charCodeAt(0)+1);
}

function processPlanningProcessJson(json) {
	// read cells
	var cellItems = json.feed.entry;
	var res = [];
	for (e in cellItems) {
		var o = cellItems[e];
		res[o.title.$t] = o.content.$t;
	}
	c = res;

	var ownerLookup = {};
	// first, get the column to owner(s) lookup table
	var l = 'D';
	while (l != 'Y') {
		var o = c[l + 12];
		// multiple names?
		if (o.indexOf(",") > 0) {
			s = o.split(",");
		} else {
			s = [ o ];
		}
		ownerLookup[l] = s;
		l = incrementColLetter(l);
	}
	console.log(ownerLookup);

	var startRow = 13;
	var blankRowCount = 0;
	var r = startRow;

	var goals = [];
	var projects = [];
	var objectives = [];
	var tasks = [];

	var lastStep = null;

	while (r++ < 42) {

		// look for a NEW goal (new name), or assume the last one otherwise

	}
	// merge results
	return { matched: goals.concat(projects).concat(objectives).concat(tasks), unmatched: unmatchedOwners };
}

Meteor.methods({
	"teal.import.importPlanningProcess": function() {
		var response = HTTP.call( 'GET', cellsFeed);
		var result = processGoalsJson(response.data);
		var goals = result.matched;

			// drop the entire table (!!!)
		GoalsCollection.remove({});

		// insert the raw goals, and update objects with ids
		goals.forEach(g => {
			var id = GoalsCollection.insert(g);
			g._id = id;
		});

		// update parent ids, and owner ids
		goals.forEach(g => {

			// TODO: update owners
			g.parent = g.parent ? g.parent._id : null;

			GoalsCollection.update(g._id, g);
		});

		// populate the path for goals, making for easy and efficient querying
		goals.forEach(g => {
			var p = g.parent;
			var path = [];
			if (p) {
				var i = 0;
				while (p) {
					console.log(p);
					console.log(i++);

					// find the parent object
					p = GoalsCollection.findOne({_id: p});

					// store the parent id
					path.push(p._id);

					// move up the tree
					p = p.parent;
				}
				path = path.reverse();
			}
			g.path = path;
			g.depth = path.length;
			GoalsCollection.update(g._id, g);
		});

		// populate the goal stats
		let populateStats = function(nodeId, recurse = true) {
			var childrenQuery = GoalsCollection.find({parent: nodeId});
			var n = GoalsCollection.findOne(nodeId);

			if (childrenQuery.count() == 0) {
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

				let children = childrenQuery.fetch();
				if (recurse) {
					// populate for children also
					children.forEach(c => populateStats(c._id));
					// read results back into collection
					children = GoalsCollection.find({parent: nodeId}).fetch();
				}
				children.forEach(c => {
						n.stats.completed += c.stats.completed;
						n.stats.inProgress += c.stats.inProgress;
						n.stats.notStarted += c.stats.notStarted;
					}
				);
			}
			GoalsCollection.update(nodeId, n);
		}

		// populate stats for root nodes
		GoalsCollection.find({parent:null}).forEach(n => populateStats(n._id));

		// calculate number of goals for contributors and cache this
		ContributorsCollection.find({}).forEach(c => {
			c.numGoals = GoalsCollection.find({ owners:c.email }).count();
			ContributorsCollection.update(c._id, c);
			if (c.numGoals > 0) {
				console.log(c.numGoals + " found for " + c.email);
			}
			RolesCollection.find({email: c.email}).forEach(r => {
				r.numGoals = c.numGoals;
				RolesCollection.update(r._id, r);
			});
		});

		// email about unmatched
		var s = "Imported " + goals.length + " goals successfully.\n\n";
		s += "Unmatched owner strings:\n" + result.unmatched.join(",");
		console.log(s);
		/*
		Email.send({
			from:"teal@mioviosion.com",
			to:"vleipnik@miovision.com",
			subject:"Imported company goals",
			text:s
		});*/
		return goals.length;
	}
});