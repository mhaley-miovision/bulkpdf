GoalDueDateLabel = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
	},

	render() {
		console.log("this.props.goal.estimatedCompletionOn = " + this.props.goal.estimatedCompletionOn)

		var gd = this.props.goal.estimatedCompletionOn;// ? new Date(this.props.goal.estimatedCompletionOn) : null;

		var complete = this.state == 2;
			//this.props.goal.stats && (this.props.goal.stats.inProgress == 0 && this.props.goal.stats.notStarted == 0)
		var overdue = gd && (gd < new Date());

		var classes = "GoalDueDate";
		if (overdue && !complete) {
			classes += " late";
		}
		return <span className={classes}>{this.props.goal.estimatedCompletionOn ?
			moment(this.props.goal.estimatedCompletionOn).format("MMM Do YY") : ''}</span>;
	},
});