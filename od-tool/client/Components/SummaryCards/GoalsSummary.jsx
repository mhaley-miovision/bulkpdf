GoalsSummary = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("goals");

		if (handle.ready()) {
			let goals = GoalsCollection.find({owners:this.props.objectId}).fetch();

			// summarize late goals, and sum up totals
			let notStarted = 0, inProgress = 0, completed = 0;
			let lateGoals = [];
			goals.forEach(g => {
				var gd = g.estimatedCompletedOn ? new Date(g.estimatedCompletedOn) : null;
				var complete = g.stats && (g.stats.inProgress == 0 && g.stats.notStarted == 0);
				var overdue = gd && (gd < new Date());
				if (!complete && overdue) {
					lateGoals.push(g);
				}
				notStarted += g.stats.notStarted;
				inProgress += g.stats.inProgress;
				completed += g.stats.completed;
			});

			let summaryGoal = { name: "Goal completion", stats: { notStarted:notStarted, inProgress:inProgress, completed:completed }  };
			this.data = { doneLoading: true, goals: goals, summaryGoal: summaryGoal, lateGoals: lateGoals };
			this.updateChart();
			return this.data;
		} else {
			return { doneLoading: false };
		}
	},

	messageOnClick() {
		Materialize.toast( "Not implemented yet, stay tuned!", 1000);
	},

	renderGoalsControls(g) {
		let controls = [];

		// public controls
		controls.push(
			<a key={g._id+"1"} onClick={this.messageOnClick} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">message</i>
			</a>
		);

		// private controls
		// TODO: check for permissions here

		controls.push(
			<a key={g._id+"2"} href="#" className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_down</i>
			</a>
		);
		controls.push(
			<a key={g._id+"3"} href="#" className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_up</i>
			</a>
		);

		return controls;
	},

	renderLateGoals() {
		if (this.data.doneLoading) {
			return this.data.lateGoals.map(g => {
				return (
					<li className="collection-item" key={g._id}>
						<div className="collection-item-text">
							{g.name},
						</div>
						{this.renderGoalsControls(g)}
					</li>
				);
			});
		}
	},

	getLateClasses() {
		let classes = "goalDueDate right";
		if (this.data.lateGoals.length > 0) {
			classes += " late";
		}
		return classes;
	},

	renderLateGoalsHeader() {
		if (this.data.lateGoals.length > 0) {
			return (
				<li className="collection-item summaryCardSubHeader">
					Late goals
				</li>
			);
		}
	},

	updateChart() {
		let _this = this;
		setTimeout(function () {
			// Get context with jQuery - using jQuery's .get() method.
			var ctx = $("#goalDonutChart").get(0).getContext("2d");

			// This will get the first returned node in the jQuery collection.
			var c = new Chart(ctx);

			/*
			Chart.types.Doughnut.extend({
				name: "DoughnutAlt",
				draw: function() {
					Chart.types.Doughnut.prototype.draw.apply(this, arguments);
					this.chart.ctx.fillStyle = 'black';
					this.chart.ctx.font = "16pt Arial";
					this.chart.ctx.textBaseline = 'middle';

					//TODO: hack because I'm tired and impatient with this fidgetting at this point
					var xOffset = 30;
					if (this.segments[0].value >= 10) {
						xOffset = 21;
					} else if (this.segments[0].value === 100) {
						xOffset = 17;
					}

					this.chart.ctx.fillText(this.segments[0].value + "%", 30, 40, 140);
				}
			});
			*/

			var g = _this.data.summaryGoal;
			var data = [
				{
					value: g.stats.completed,
					color:"#46BFBD",
					highlight: "#FF5A5E",
					label: "Completed"
				},
				{
					value: g.stats.inProgress,
					color:"#FDB45C",
					highlight: "#FFC870",
					label: "In Progress"
				},
				{
					value: g.stats.notStarted,
					color: "#ff6666",
					highlight: "#FF5A5E",
					label: "Not Started",
				},
			];

			var ctx = $('#goalDonutChart').get(0).getContext("2d");

			var myDoughnut = new Chart(ctx).Doughnut(data,{
				animation:true,
				animationSteps: 50,
				responsive: true,
				showTooltips: false,
				percentageInnerCutout : 80,
				segmentShowStroke : false,
				onAnimationComplete: function() {
					var canvasWidthvar = $('#goalDonutChart').width();
					var canvasHeight = $('#goalDonutChart').height();
					//this constant base on canvasHeight / 2.8em
					var constant = 104;
					var fontsize = (canvasHeight/constant).toFixed(2);
					ctx.font=fontsize +"em Verdana";
					ctx.textBaseline="middle";
					ctx.fillStyle = "#999999";
					var total = 0;
					$.each(data,function() {
						total += parseInt(this.value,10);
					});
					var tpercentage = ((data[0].value/total)*100).toFixed(2)+"%";
					var textWidth = ctx.measureText(tpercentage).width;

					var txtPosx = Math.round((canvasWidthvar - textWidth)/2);
					ctx.fillText(tpercentage, txtPosx, canvasHeight/2);
				}
			});
		}, 50);
	},

	getCompleteAsPercentString() {
		var total = this.data.summaryGoal.stats.completed + this.data.summaryGoal.stats.inProgress + this.data.summaryGoal.stats.notStarted;
		return Math.ceil(this.data.summaryGoal.stats.completed / total * 100) + "%";
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Goals</li>

						<li className="collection-item">
							<div style={{width:"120px", height: "120px"}} className="goalDonutChart">
								<canvas id="goalDonutChart" width="90" height="90">
								</canvas>
							</div>
						</li>
						<li className="collection-item">
							<div className="collection-item-text">Number of overdue goals: </div>
							<span className={this.getLateClasses()} style={{margin:"4px 10px 0 0"}}>{this.data.lateGoals.length} late</span>
						</li>

						{this.renderLateGoalsHeader()}
						{this.renderLateGoals()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
});