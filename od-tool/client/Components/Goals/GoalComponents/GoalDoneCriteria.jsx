GoalDoneCriteria = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired
	},

	renderDoneCriteriaItems() {
		let _this = this;
		return this.props.goal.doneCriteria.map(function(o,i) {
			return <GoalDoneCriterion key={o._id} doneCriterion={o} goal={_this.props.goal}/>
		});
	},

	render() {
		if (this.props.goal.doneCriteria.length > 0) {
			return (
				<div>
					<div className="GoalSubtitle hide-on-small-only">What Done Looks Like</div>
					<div className="GoalSubtitleMobile hide-on-med-and-up center">What Done Looks Like</div>
					<ul className="ProjectGoalDoneCriteria">
						{this.renderDoneCriteriaItems()}
					</ul>
				</div>
			);
		} else {
			return false;
		}
	},
});