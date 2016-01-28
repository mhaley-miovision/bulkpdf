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

	var startRow = 69; // ignore last year's goals for now
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
		"Paul" : "prunsfleld@miovision.com",
		"Dale" : "dhammil@miovision.com",
		"Ben" : "bmitchell@miovision.com",
		"Justin" : "jeichel@miovision.com",
		"Timo" : "thoffmann@miovision.com",
		"James" : "jbarr@miovision.com",
		"Corey" : "cmartella@miovision.com",
		"Erin" : "eskimson@miovision.com",
		"James" : "jbarr@miovision.com",
		"Matt M" : "mmarcucci@moivision.com",
		"Kyle" : "kothmer@moivision.com",
		"JamesL" : "jelegue@moivision.com",
		"Lynda" : "lchau@moivision.com",
		"Phil" : "pguerrin@moivision.com",
		"Lynda" : "lchau@moivision.com",
		"Vic" : "vleipnik@miovision.com",
		"Lauren" : "lgreig@miovision.com",
	};

	function processOwners(o) {
		var s = [];
		if (o) {
			// ughhhh
			if (o.indexOf("(") > 0 && o.indexOf(")") > 0) {
				o = o.replace("(", ",");
				o = o.replace(")", "");
			}

			if (o.indexOf(",") < 0) {
				s = o.split("/");
			} else {
				s = o.split(",");
			}
			for (i in s) {
				x = lookup[s[i]];
				if (x) {
					s[i] = x;
				}
			}
		}
		return s;
	}

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
				estimatedCompletedOn: r < 65 ? Date.parse("Dec 31, 2015") : Date.parse("Dec 31, 2016"),
				owners: ["kmcbride@miovision.com"], // Kurtis???
			};
			goals.push(lastGoal);
		}

		// find projects
		var p = c["C"+r];
		if (p && (lastProject == null || p != lastProject.name)) {
			lastProject = {
				parent: lastGoal,
				name: p,
				owners: processOwners(c["D"+r]),
			};
			projects.push(lastProject);

			// reset this so merged columns will work properly
			lastKeyObjectiveOwnersRaw = null;
		}

		// find key objectives
		var ko = c["G" + r];
		var dc = c["H" + r];
		if (typeof(ko) !== 'undefined'  || typeof(dc) !== 'undefined') {

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
			}
			objective.owners = processOwners(lastKeyObjectiveOwnersRaw);

			objectives.push(objective);
			lastKeyObjective = objective;
		}

		// get the task
		var t = c["L"+r];
		if (typeof(o) !== 'undefined') {
			var task = {
				parent: lastKeyObjective,
				name: t,
				status: c["M"+r],
				owners: processOwners(c["N"+r]),
				estimatedCompletedOn: c["O"+r],
				links: c["P"+r],
			};
			tasks.push(task);
		}
	}
	// merge results
	return goals.concat(projects).concat(objectives).concat(tasks);
}

Meteor.methods({
	importGoals() {
		var response = HTTP.call( 'GET', cellsFeed);
		var goals = processGoalsJson(response.data);

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
		return goals.length;
	}
});