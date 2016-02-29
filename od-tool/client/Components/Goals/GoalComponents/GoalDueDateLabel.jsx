GoalDueDateLabel = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
	},

	render() {
		let gd = this.props.goal.estimatedCompletionOn;
		let complete = this.state == 2;
		let overdue = gd && (gd < new Date());
		let classes = "GoalDueDate";
		if (overdue && !complete) {
			classes += " late";
		}
		return <span className={classes}>{this.props.goal.estimatedCompletionOn ?
			moment(this.props.goal.estimatedCompletionOn).format("MMM Do YY") : ''}</span>;
	},
});