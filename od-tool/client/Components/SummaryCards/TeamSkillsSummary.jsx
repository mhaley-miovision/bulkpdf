TeamSkillsSummary = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		orgName: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("roles");
		let handle2 = Meteor.subscribe("skills");
		let handle3 = Meteor.subscribe("organizations");

		if (handle.ready() && handle2.ready() && handle3.ready()) {
			// get organization id
			let org = OrganizationsCollection.findOne({name:this.props.orgName});

			// get unique user emails
			let users = _.uniq(RolesCollection.find({orgPath:org._id}, {email: 1}).fetch().map(function(x) {
				return x.email;
			}), true);

			// get skills, and ensure skills must be alpha sorted
			var skills = [];
			var skillRatings = {};
			SkillsCollection.find({email: { $in: users }}, {sort: { skill: 1 }}).fetch().forEach(function(x) {
				if (!skillRatings[x.email]) {
					skillRatings[x.email] = {};
				}
				skillRatings[x.email][x.skill] = x.rating;
				skills.push(x.skill); // just keep track of all skills
			});
			skills = _.uniq(skills);
			skills.sort();

			this.data = { skills: skills, skillRatings: skillRatings, doneLoading: true }

			if (skills.length > 0) {
				this.updateChart();
			}
			return this.data;
		} else {
			return { doneLoading: false };
		}
	},

	updateChart() {
		if (!this.data.skills || this.data.skills.length <= 0) {
			return;
		}
		let _this = this;

		setTimeout(function () {
			// Get context with jQuery - using jQuery's .get() method.
			let ctx = $("#skillsPolarGraph").get(0).getContext("2d");
			// This will get the first returned node in the jQuery collection.
			let myNewChart = new Chart(ctx);

			let labels = _this.data.skills;
			let data = {
				labels: labels,
				datasets: [],
			};
			for (var email in _this.data.skillRatings) {
				let sr = _this.data.skillRatings[email];

				// put skills in same order as labels for this user
				let skillsData = [];
				for (var i = 0; i < labels.length; i++) {
					skillsData.push(sr[labels[i]]);
				}
				data.datasets.push({
					label: email.split('@')[0],
					fillColor: "rgba(220,220,220,0.2)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: skillsData
				});
			};
			ctx.canvas.width = 400;
			ctx.canvas.height = 400;
			var c = new Chart(ctx).Radar(data, Chart.defaults.Radar );

		}, 10);
	},

	componentDidUpdate(nextProps, nextState) {
		if (this.data.doneLoading && this.data.skills) {
			this.updateChart();
		}
	},

	renderCanvas() {
		if (this.data.skills && this.data.skills.length > 0) {
			return (
				<div>
					<canvas id="skillsPolarGraph" width="175px" height="175px" className="skillsPolarGraph"></canvas>
				</div>
			);
		} else {
			return (
				<div className="grey-text">
					<p style={{textAlign:"center"}}>
						{this.props.orgName} has no skills defined yet.
					</p>
				</div>
			);
		}
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Skills</li>
						{this.renderCanvas()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
});