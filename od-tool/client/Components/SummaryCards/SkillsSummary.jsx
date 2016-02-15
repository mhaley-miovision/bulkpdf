SkillsSummary = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("contributors");
		let handle2 = Meteor.subscribe("skills");

		if (handle.ready() && handle2.ready()) {
			let c = ContributorsCollection.findOne({email: this.props.objectId});
			let s = SkillsCollection.find({email: this.props.objectId }).fetch();
			this.data = { skills: s, doneLoading: true, name: c.name }
			if (s.length > 0) {
				this.updateChart();
			}
			return this.data;
		} else {
			return { doneLoading: false };
		}
	},

	updateChart() {
		let _this = this;
		setTimeout(function () {
			// Get context with jQuery - using jQuery's .get() method.
			var ctx = $("#skillsPolarGraph").get(0).getContext("2d");
			// This will get the first returned node in the jQuery collection.
			var myNewChart = new Chart(ctx);

			var labels = [];
			var data = [];
			_this.data.skills.forEach(s => {
				labels.push(s.skill);
				data.push(s.rating);
			});

			var data = {
				labels: labels,
				datasets: [
					{
						label: "Skills",
						fillColor: "rgba(220,220,220,0.2)",
						strokeColor: "rgba(220,220,220,1)",
						pointColor: "rgba(220,220,220,1)",
						pointStrokeColor: "#fff",
						pointHighlightFill: "#fff",
						pointHighlightStroke: "rgba(220,220,220,1)",
						data: data
					},
				]
			};

			var c = new Chart(ctx).Radar(data, Chart.defaults.Radar );

		}, 10);
	},

	renderCanvas() {
		if (this.data.skills.length > 0) {
			return (
				<div>
					<canvas id="skillsPolarGraph" width="175px" height="175px" className="skillsPolarGraph"></canvas>
				</div>
			);
		} else {
			return (
				<div className="grey-text">
					<p style={{textAlign:"center"}}>
						{this.data.name} has no skills defined yet.
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