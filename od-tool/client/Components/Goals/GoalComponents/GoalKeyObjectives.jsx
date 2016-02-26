GoalKeyObjectives = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired
	},

	renderKeyObjectivesItems() {
		return this.props.goal.keyObjectives.map(function(o,i) {
			return (
				<GoalKeyObjective key={o._id} keyObjective={o}/>
			);
		});
	},

	render() {
		if (this.props.goal.keyObjectives.length > 0) {
			return (
				<section>
					<div className="ProjectGoalSubtitle">Key Objectives</div>
					<ul className="ProjectGoalDoneCriteria">{this.renderKeyObjectivesItems()}</ul>
				</section>
			);
		} else {
			return <section/>
		}
	},
});