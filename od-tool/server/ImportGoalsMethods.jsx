var key = '1cCbZtpGdPhfaM3Y-sBcfoKMR2_jIP_rXgooqZQ5CtbE';
var url = "https://spreadsheets.google.com" + "/feeds/worksheets/" + key + "/public/basic?alt=json";
var cellsFeed = "https://spreadsheets.google.com/feeds/cells/1cCbZtpGdPhfaM3Y-sBcfoKMR2_jIP_rXgooqZQ5CtbE/olh8u5s/public/basic?alt=json";

function processGoalsJson(json) {
	var cellItems = json.feed.entry;

	var res = [];
	for (e in cellItems) {
		var o = cellItems[e];
		res[o.title.$t] = o.content.$t;
	}

	//return res;
	c = res;

	var startRow = 69;//5; // ignore last year's goals for now
	var blankRowCount = 0;
	var r = startRow;

	var goals = [];
	var projects = [];
	var objectives = [];
	var tasks = [];

	var lastKeyObjective = null;
	var lastProject = null;
	var lastGoal = null;
	var lastKeyObjectiveOwnersRaw = null;

	lookup = {
		"Tony" : "tbrijpaul@miovision.com",
		"Kurtis" : "kmcbride@miovision.com",
		"Bryan" : "bpeters@miovision.com",
		"Jamie" : "jreeve@miovision.com",
		"Bobbi" : "bholte@miovision.com",
		"Cam" : "cdavies@miovision.com",
		"JP" : "jbhavnani@miovision.com",
		"Jenn" : "jwincey@miovision.com",
		"Dave" : "dbullock@miovision.com",
		"Brian W." : "bward@miovision.com",
		"Brian W" : "bward@miovision.com",
		"Brian" : "bward@miovision.com",
		"Paul" : "prunstedler@miovision.com",
		"Paul R" : "prunstedler@miovision.com",
		"Dale" : "dhammil@miovision.com",
		"Ben" : "bmitchell@miovision.com",
		"Justin" : "jeichel@miovision.com",
		"Timo" : "thoffmann@miovision.com",
		"James" : "jbarr@miovision.com",
		"Corey" : "cmartella@miovision.com",
		"Erin" : "eskimson@miovision.com",
		"Matt M" : "mmarcucci@miovision.com",
		"Kyle" : "kothmer@miovision.com",
		"JamesL" : "jlegue@miovision.com",
		"JL" : "jlegue@miovision.com",
		"James L" : "jlegue@miovision.com",
		"Lynda" : "lchau@miovision.com",
		"Phil" : "pguerin@miovision.com",
		"Lynda" : "lchau@miovision.com",
		"Vic" : "vleipnik@miovision.com",
		"Natalie" : "ndumond@miovision.com",
		"Natalie [S" : "ndumond@miovision.com",
		"Lauren" : "lgreig@miovision.com",
		"Mohan" : "mthomas@miovision.com",
		"Bullock" : "dbullock@miovision.com",
		"Kashif" : "kumer@miovision.com",
		"Kate" : "klaber@miovision.com",
		"Mike" : "mmartin@miovision.com",
		"Matt I" : "mignor@miovision.com",
		"Matt" : "mignor@miovision.com",
		"Matt Ignor" : "mignor@miovision.com",
		"Jason" : "jchan@miovision.com",
		"Jan" : "jbergstrom@miovision.com",
		"Karen" : "knordby-wadel@miovision.com",
		"Lisa" : "lwilhelm@miovision.com",
		"Chelsea" : "ctam@miovision.com",
	}

	function processOwners(o) {
		//console.log("input: " + o)
		var s = []; var s2 = [];
		if (o) {
			// ughhhh #1
			if (o.indexOf("(") > 0 && o.indexOf(")") > 0) {
				o = o.replace("(", ",");
				o = o.replace(")", "");
			}
			// ughhhh #2 - clear stuff between brackets
			while (o.indexOf("[") > 0 && o.indexOf("]") > 0) {
				var i1 = o.indexOf("[");
				var i2 = o.indexOf("]")
				var ss2 = o.substring(i2 + 1, o.length - 1);
				var ss1 = o.substring(0, i1 - 1);
				o = ss1 + ss2;
			}

			if (o.indexOf("\n") > 0) {
				o = o.replace(/\n/g, ",");
			}

			if (o.indexOf("/") > 0) {
				o = o.replace(/\//g, ",");
			}

			// multiple names?
			if (o.indexOf(",") > 0) {
				s = o.split(",");
			} else {
				s = [ o ];
			}

			for (i in s) {
				var l = s[i].trim();
				x = lookup[l];
				if (x) {
					s[i] = x;
				} else {
					l = _.escape(l);
					console.log("unmatched: '" + l + "'");
					s2.push(l);
				}
			}
		}
		var result = { matched: s, unmatched: s2 };
		//console.log(result);
		return result;
	}

	var unmatchedOwners = [];
	var numObjectives = 0;

	while (r++ < 2000) {
		if (r == 64 || r == 65 || r == 66 || r == 67 || r == 68 || r == 69) { // HOLY FUCK LORD HELP ME LOL, I NEED TO NUKE THE SHIT OUT OF THIS WHOLE SCRIPT VERY FAST
			continue; // don't parse crap headers
		}

		if (typeof(c["L"+r]) === 'undefined') {
			if (blankRowCount++ > 10) {
				break;
			}
			continue;
		}

		// look for a NEW goal (new name), or assume the last one otherwise
		var g = c["B"+r];
		if (g && (lastGoal == null || g != lastGoal.name)) {
			// new goal found
			lastGoal = {
				name: c["B"+r],
				// TODO: haxxor on the date
				estimatedCompletedOn: r < 65 ? "12/31/2015" : "7/1/2016",
				owners: ["kmcbride@miovision.com"], // Kurtis???
			};
			goals.push(lastGoal);
		}

		// find projects
		var p = c["C"+r];
		if (p && (lastProject == null || p != lastProject.name)) {

			// new project, "close off" the previous project
			// if the project only had one key objective, then collapse it upward
			if (lastProject && numObjectives == 1) {
				console.log("project[" + lastProject.name + "] should be consolidated!");
			}

			// reset objectives
			numObjectives = 0;

			var result = processOwners(c["D"+r]);
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);
			lastProject = {
				parent: lastGoal,
				name: p,
				owners: result.matched,
			};
			projects.push(lastProject);

			// reset this so merged columns will work properly
			lastKeyObjectiveOwnersRaw = null;
		}

		// find key objectives
		var ko = c["G" + r];
		var dc = c["H" + r];
		if (typeof(ko) !== 'undefined' || typeof(dc) !== 'undefined') {

			// TODO: REEVALUATE THIS
			if (typeof(ko) === 'undefined') {
				ko = dc; // make the same as the done criteria (legacy)
			}

			// new objectives found
			var objective = {
				parent: lastProject,
				name: ko,
				doneCriteria: dc,
				status: c["I" + r],
				estimatedCompletedOn: c["J" + r],
			};

			// if no owners defined, check if last was set (merged column OR it will be pulled from manager owner, so this has to be reset)
			if (typeof(c["E" + r]) !== 'undefined') {
				lastKeyObjectiveOwnersRaw = c["E" + r];
			}			var result = processOwners(lastKeyObjectiveOwnersRaw);
			objective.owners = result.matched;
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);

			objectives.push(objective);
			numObjectives++;
			lastKeyObjective = objective;
		}

		// get the task
		var t = c["L"+r];
		if (typeof(o) !== 'undefined') {
			var result = processOwners(c["N"+r]);
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);
			var task = {
				parent: lastKeyObjective,
				name: t,
				status: c["M"+r],
				owners: result.matched,
				estimatedCompletedOn: c["O"+r],
				links: c["P"+r],
			};
			tasks.push(task);
		}
	}
	// merge results
	return { matched: goals.concat(projects).concat(objectives).concat(tasks), unmatched: unmatchedOwners };
}

Meteor.methods({
	"teal.import.importGoals": function() {
		var response = HTTP.call( 'GET', cellsFeed);
		var result = processGoalsJson(response.data);
		var goals = result.matched;

		// drop the entire table (!!!)
		GoalsCollection.remove({rootOrgId:"miovision-root"});

		// insert the raw goals, and update objects with ids
		goals.forEach(g => {
			g.rootOrgId = "miovision-root";
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
					n.state = 2;
				} else if (n.status && n.status.toLowerCase() === 'in progress') {
					n.stats = { completed:0, inProgress:1, notStarted:0 };
					n.state = 1;
				} else if (n.status && n.status.toLowerCase() === 'not started') {
					n.stats = { completed:0, inProgress:0, notStarted:1 };
					n.state = 0;
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

		/*
		// populate a goal children array for easy rendering access
		GoalsCollection.find({}).forEach(g => {
			let childrenQuery = GoalsCollection.find({parent: g._id}, {fields: {_id: 1}});
			let children = [];
			if (childrenQuery.count() > 0) {
				children = childrenQuery.fetch();
			}
			GoalsCollection.update(g._id, {$set: {children: children}});
		});*/

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