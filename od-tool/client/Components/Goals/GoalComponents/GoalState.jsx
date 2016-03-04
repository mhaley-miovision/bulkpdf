GoalState = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
	},

	render() {
		let label = "Not Started";
		if (this.props.goal.state == 2) {
			label = "Completed";
		} else if (this.props.goal.state == 1) {
			label = "In Progress";
		}
		let classes = "TaskGoalState" + label.replace(" ", "");
		return <div className={classes}>{label}</div>;
	}
});