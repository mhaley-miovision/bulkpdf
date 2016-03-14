GoalUpToParentButton = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
	},

	goToParentGoal() {
		let url = FlowRouter.path("goalById", {goalId: this.props.goal.parent}, {});
		FlowRouter.go(url);
	},

	render() {
		// parent is a root goal
		if (this.props.goal.parent === this.props.goal.rootGoalId) {
			return <span data-tip="Top level goal" className="ProjectTag valign">{this.props.goal.rootGoalName}</span>
		} else {
			return <i style={{fontSize:"13px"}} className="material-icons GreyButtonSmall valign"
					  data-tip="Go to parent goal" onClick={this.goToParentGoal}>undo</i>
		}
	}
});