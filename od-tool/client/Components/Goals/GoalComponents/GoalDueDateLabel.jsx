GoalDueDateLabel = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
	},

	render() {
		var gd = this.props.goal.estimatedCompletedOn;// ? new Date(this.props.goal.estimatedCompletedOn) : null;
		var complete = this.props.goal.stats && (this.props.goal.stats.inProgress == 0 && this.props.goal.stats.notStarted == 0);
		var overdue = gd && (gd < new Date());

		var classes = "GoalDueDate";
		if (overdue && !complete) {
			classes += " late";
		}
		return <span className={classes}>{this.props.goal.estimatedCompletedOn ?
			moment(this.props.goal.estimatedCompletedOn).format("MMM Do") : ''}</span>;
	},
});