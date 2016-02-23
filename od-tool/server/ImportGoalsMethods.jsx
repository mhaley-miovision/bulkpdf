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
	var tasks = [];

	var lastKeyObjective = null;
	var lastProject = null;
	var lastGoal = null;
	;

	lookup = {
		"Tony": "tbrijpaul@miovision.com",
		"Kurtis": "kmcbride@miovision.com",
		"Bryan": "bpeters@miovision.com",
		"Jamie": "jreeve@miovision.com",
		"Bobbi": "bholte@miovision.com",
		"Cam": "cdavies@miovision.com",
		"JP": "jbhavnani@miovision.com",
		"Jenn": "jwincey@miovision.com",
		"Dave": "dbullock@miovision.com",
		"Brian W.": "bward@miovision.com",
		"Brian W": "bward@miovision.com",
		"Brian": "bward@miovision.com",
		"Paul": "prunstedler@miovision.com",
		"Paul R": "prunstedler@miovision.com",
		"Dale": "dhammil@miovision.com",
		"Ben": "bmitchell@miovision.com",
		"Justin": "jeichel@miovision.com",
		"Timo": "thoffmann@miovision.com",
		"James": "jbarr@miovision.com",
		"Corey": "cmartella@miovision.com",
		"Erin": "eskimson@miovision.com",
		"Matt M": "mmarcucci@miovision.com",
		"Kyle": "kothmer@miovision.com",
		"JamesL": "jlegue@miovision.com",
		"JL": "jlegue@miovision.com",
		"James L": "jlegue@miovision.com",
		"Lynda": "lchau@miovision.com",
		"Phil": "pguerin@miovision.com",
		"Lynda": "lchau@miovision.com",
		"Vic": "vleipnik@miovision.com",
		"Natalie": "ndumond@miovision.com",
		"Natalie [S": "ndumond@miovision.com",
		"Lauren": "lgreig@miovision.com",
		"Mohan": "mthomas@miovision.com",
		"Bullock": "dbullock@miovision.com",
		"Kashif": "kumer@miovision.com",
		"Kate": "klaber@miovision.com",
		"Mike": "mmartin@miovision.com",
		"Matt I": "mignor@miovision.com",
		"Matt": "mignor@miovision.com",
		"Matt Ignor": "mignor@miovision.com",
		"Jason": "jchan@miovision.com",
		"Jan": "jbergstrom@miovision.com",
		"Karen": "knordby-wadel@miovision.com",
		"Lisa": "lwilhelm@miovision.com",
		"Chelsea": "ctam@miovision.com",
	}

	var parseOwners = function (o) {
		var s = [];
		var s2 = [];
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
				s = [o];
			}

			for (i in s) {
				var l = s[i].trim();
				if (l !== '') {
					x = lookup[l];
					if (x) {
						s[i] = x;
					} else {
						l = l.trim();
						l = _.escape(l);
						s2.push(l);
					}
				}
			}
		}
		var result = {matched: s, unmatched: s2};
		return result;
	}

	var parseNewlineSeparatedList = function (l) {
		var split = l.split('\n');
		var items = [];
		for (var i = 0; i < split.length; i++) {
			var s = split[i].trim();

			// remove #)
			var rp = s.indexOf(")");
			if (rp >= 0) {
				s = s.split(")")[1].trim();
			}

			if (s !== '' && s !== '.') {
				items.push(s);
			}
		}
		return items;
	}

	var unmatchedOwners = [];

	var MAX_ROWS = 2000;

	while (r++ < MAX_ROWS) {
		if (r == 64 || r == 65 || r == 66 || r == 67 || r == 68 || r == 69) { // HOLY FUCK LORD HELP ME LOL, I NEED TO NUKE THE SHIT OUT OF THIS WHOLE SCRIPT VERY FAST
			continue; // don't parse crap headers
		}

		if (typeof(c["L" + r]) === 'undefined') {
			if (blankRowCount++ > 100) {
				break;
			}
			continue;
		}

		// look for a NEW goal (new name), or assume the last one otherwise
		var g = c["B" + r];
		if (g && (lastGoal == null || g != lastGoal.name)) {
			// new goal found
			lastGoal = {
				name: c["B" + r],
				// TODO: haxxor on the date
				estimatedCompletedOn: r < 65 ? "12/31/2015" : "7/1/2016",
				owners: ["kmcbride@miovision.com"], // Kurtis???
			};
			goals.push(lastGoal);
		}

		// find projects
		var p = c["C" + r];
		if (p && (lastProject == null || p != lastProject.name)) {
			// owners
			var result = parseOwners(c["D" + r]);
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);
			var owners = result.matched;

			// get contributors
			result = parseOwners(c["E" + r]);
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);
			var contributors = result.matched;

			// get key objectives
			var ko = c["G" + r];
			var keyObjectives = ko ? parseNewlineSeparatedList(ko) : [];
			var dc = c["H" + r];
			var doneCriteria = dc ? parseNewlineSeparatedList(dc) : [];

			// TODO: !!!!!! now determine if multiple sub goals here !!!!!!
			var lastP = c["C" + r];
			var tempR = r;
			var lastKo = ko;
			var lastDc = dc;
			while (++tempR < MAX_ROWS) {

				// if new project detected, break out of this loop
				var testP = c["C" + tempR];
				if (testP && testP !== lastP) {
					break;
				}

				// account for too many blank rows in the task column
				if (typeof(c["L" + tempR]) === 'undefined') {
					if (blankRowCount++ > 100) {
						break;
					}
					continue;
				}

				// get new key objectives and done criteria (and make sure they are new)
				var ko2 = c["G" + tempR];
				var dc2 = c["H" + tempR];

				if (ko2 && ko2 != lastKo) {
					var keyObjectives2 = parseNewlineSeparatedList(ko2);
					var doneCriteria2 = dc2 ? parseNewlineSeparatedList(dc2) : [];
					keyObjectives = keyObjectives.concat(keyObjectives2);
					doneCriteria = doneCriteria.concat(doneCriteria2);
					lastKo = ko2;
					lastDc = dc2;
				}
			}

			// store the project
			lastProject = {
				parent: lastGoal,
				name: p,
				owners: owners,
				contributors: contributors,
				doneCriteria: doneCriteria,
				keyObjectives: keyObjectives,
				status: c["M" + r],
				estimatedCompletionOn: c["J" + r] ? new Date(c["J" + r]) : null,
			};
			projects.push(lastProject);
		}

		// get the tasks
		var t = c["L" + r];
		if (typeof(t) !== 'undefined') {
			var result = parseOwners(c["N" + r]);
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);

			// TODO: !!!!!! check if parent is the project, or there is a sub project situation here !!!!!!
			var d = c["O" + r];
			var date = d ? new Date(d) : null;

			var task = {
				parent: lastProject,
				name: t,
				status: c["M" + r],
				owners: result.matched,
				estimatedCompletedOn: date,
				links: c["P" + r],
			};
			tasks.push(task);
		}
	}
	return {matched: goals.concat(projects).concat(tasks), unmatched: unmatchedOwners};
}
/*
 // SUMMARY OF PARSING INTERPRETATION
 // goals with single key objective and single done criteria show done criteria and parse out key objective string
 // goals without key objectives but done criterias show no key objectives, but show the done criteria - single goal
 // goals with multiple key objectives and multiple done criteria

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

 // copy all tasks as a child of the last project instead of key objective
 for (var i = 0; i < tasks.length; i++) {
 if (tasks[i].parent === lastKeyObjective) {
 tasks[i].parent = lastProject;
 }
 }

 lastKeyObjective
 }

 // reset objectives
 numObjectives = 0;

 var result = parseOwners(c["D"+r]);
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
 }			var result = parseOwners(lastKeyObjectiveOwnersRaw);
 objective.owners = result.matched;
 unmatchedOwners = unmatchedOwners.concat(result.unmatched);

 objectives.push(objective);
 numObjectives++;
 lastKeyObjective = objective;
 }

 // get the task
 var t = c["L"+r];
 if (typeof(o) !== 'undefined') {
 var result = parseOwners(c["N"+r]);
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

 */

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
			var rootGoal = null;
			var path = [];
			if (p) {
				var i = 0;
				while (p) {
					// find the parent object
					p = GoalsCollection.findOne({_id: p});

					// store the parent id
					path.push(p._id);

					// move up the tree
					rootGoal = p; // assume this could be root
					p = p.parent;
				}
				path = path.reverse();
			}
			g.path = path;
			g.depth = path.length;

			// for easy access - these are not likely to change
			if (rootGoal != null) {
				g.rootGoalName = rootGoal.name;
				g.rootGoalId = rootGoal._id;
			} else {
				g.rootGoalName = null;
				g.rootGoalId = null;
			}

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