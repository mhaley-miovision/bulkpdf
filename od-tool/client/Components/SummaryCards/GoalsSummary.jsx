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

			return { doneLoading: true, goals: goals, summaryGoal: summaryGoal, lateGoals: lateGoals }
		} else {
			return { doneLoading: false };
		}
	},

	messageOnClick() {
		Materialize.toast( "Not implemented yet, stay tuned!", 1000);
	},

	renderGoalsControls(g) {
		let controls = [];

		// TODO: implement actually jumping to the role, not the contributor
		var url1 = FlowRouter.path("organizationView", {}, { objectId: g.organization, objectType:"organization"});

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

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Goals</li>

						<li className="collection-item">
							<div className="collection-item-text">Completion progress ({this.data.goals.length} goals): </div>
							<div className="right">
								<SimpleGoalProgressBar margin="6px 0 0 0" goal={this.data.summaryGoal}/>
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