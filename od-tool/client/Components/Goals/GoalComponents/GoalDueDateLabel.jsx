GoalDueDateLabel = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
	},

	render() {
		let gd = this.props.goal.dueDate;
		let complete = this.state == 2;
		let overdue = gd && (gd < new Date());
		let classes = "GoalDueDate";
		if (overdue && !complete) {
			classes += " late";
		}
		return <span className={classes}>{ this.props.goal.dueDate ? this.props.goal.dueDate : ''}</span>;
	},
});