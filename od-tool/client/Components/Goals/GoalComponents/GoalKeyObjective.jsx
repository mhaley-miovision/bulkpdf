GoalKeyObjective = React.createClass({
	propTypes: {
		keyObjective: React.PropTypes.object.isRequired
	},

	toggleCompleted() {
		// Set the checked property to the opposite of its current value
		Meteor.call("teal.goals.setKeyObjective", this.props.keyObjective._id, !this.props.keyObjective.completed);
	},

	render() {
		var o = this.props.keyObjective;
		return (
			<li key={o._id} className="ProjectGoalKeyObjective">
				<input id={o._id} type="checkbox" readOnly={true} checked={o.completed} onClick={this.toggleCompleted}/>
				<label htmlFor={o._id}>{o.name}</label>
			</li>
		);
	},
});