GoalState = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
	},

	handleOnClick(evt) {
		Meteor.call("teal.goals.setGoalState", this.props.goal._id, this.incrementState(this.props.goal.state));
		evt.stopPropagation();
	},

	incrementState(state) {
		return (state + 1) % 3;
	},

	stateToLabel(state) {
		let label = "Not Started";
		if (state == 2) {
			label = "Completed";
		} else if (state == 1) {
			label = "In Progress";
		}
		return label;
	},

	toolTipId() {
		return "gs" + this.props.goal._id;
	},

	render() {
		let label = this.stateToLabel(this.props.goal.state);
		let classes = "TaskGoalState" + label.replace(" ", "");
		return (
			<div className={classes} onClick={this.handleOnClick} style={{cursor:"pointer"}} data-for={this.toolTipId()}
				 data-tip={"Change to '" + this.stateToLabel(this.incrementState(this.props.goal.state)) + "'"}>{label}
				<ReactTooltip id={this.toolTipId()} place="bottom"/>
			</div>
		);
	}
});