GoalDoneCriteria = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired
	},

	renderDoneCriteriaItems() {
		return this.props.goal.doneCriteria.map(function(o,i) {
			return <GoalDoneCriterion key={o._id} goalCriterion={o}/>
		});
	},

	render() {
		if (this.props.goal.doneCriteria.length > 0) {
			return (
				<section>
					<div className="ProjectGoalSubtitle">What Done Looks Like</div>
					<ul className="ProjectGoalDoneCriteria">
						{this.renderDoneCriteriaItems()}
					</ul>
				</section>
			);
		} else {
			return <section/>;
		}
	},
});