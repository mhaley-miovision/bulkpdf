GoalDoneCriterion = React.createClass({
	propTypes: {
		goalCriterion : React.PropTypes.object.isRequired
	},

	toggleCompleted() {
		// Set the checked property to the opposite of its current value
		let changeObject = Teal.createChangeObject(Teal.ChangeTypes.UpdateGoalProgress, Teal.ObjectTypes.Goal,
			"teal.goals.setDoneCriterion", [ this.props.goalCriterion._id, !this.props.goalCriterion.completed ]);
		Meteor.call("teal.changes.create", changeObject, Teal.notifyChangeResult);
	},

	render() {
		let o = this.props.goalCriterion;
		return (
			<li key={o._id} className="ProjectGoalKeyObjective">
				<input id={o._id} type="checkbox" readOnly={true} checked={o.completed} onClick={this.toggleCompleted}/>
				<label htmlFor={o._id}>{o.name}</label>
			</li>
		);
	}
});