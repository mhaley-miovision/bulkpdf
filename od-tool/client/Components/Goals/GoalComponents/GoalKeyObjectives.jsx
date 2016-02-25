GoalKeyObjectives = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired
	},

	renderKeyObjectivesItems() {
		if (this.props.goal.keyObjectives.length > 0) {
			return this.props.goal.keyObjectives.map(function(o,i) {
				return (
					<GoalKeyObjective key={o._id} keyObjective={o}/>
				);
			});
		} else {
			return 'No key objectives defined yet.';
		}
	},

	render() {
		return (
			<section>
				<div className="ProjectGoalSubtitle">Key Objectives</div>
				<ul className="ProjectGoalDoneCriteria">{this.renderKeyObjectivesItems()}</ul>
			</section>
		);
	},
});