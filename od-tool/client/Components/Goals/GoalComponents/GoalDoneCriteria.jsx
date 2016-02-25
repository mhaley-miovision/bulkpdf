GoalDoneCriteria = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired
	},

	renderDoneCriteriaItems() {
		if (this.props.goal.doneCriteria.length > 0) {
			return this.props.goal.doneCriteria.map(function(o,i) {
				return <GoalDoneCriterion key={o._id} goalCriterion={o}/>
			});
		} else {
			return 'No done criteria defined yet.';
		}
	},

	render() {
		return (
			<section>
				<div className="ProjectGoalSubtitle">What Done Looks Like</div>
				<ul className="ProjectGoalDoneCriteria">
					{this.renderDoneCriteriaItems()}
				</ul>
			</section>
		);
	},
});