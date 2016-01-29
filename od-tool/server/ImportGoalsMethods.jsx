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

	var startRow = 5;//69; // ignore last year's goals for now
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
		"Matt M" : "mmarcucci@moivision.com",
		"Kyle" : "kothmer@moivision.com",
		"JamesL" : "jelegue@moivision.com",
		"JL" : "jelegue@moivision.com",
		"James L" : "jelegue@moivision.com",
		"Lynda" : "lchau@moivision.com",
		"Phil" : "pguerrin@moivision.com",
		"Lynda" : "lchau@moivision.com",
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
			var result = processOwners(lastKeyObjectiveOwnersRaw);
			objective.owners = result.matched;
			unmatchedOwners = unmatchedOwners.concat(result.unmatched);

			objectives.push(objective);
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
	importGoals() {
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