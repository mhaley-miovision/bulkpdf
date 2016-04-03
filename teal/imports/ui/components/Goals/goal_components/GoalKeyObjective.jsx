import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import TealChanges from '../../../../shared/TealChanges'

export default class GoalKeyObjective extends Component {
	constructor() {
		super();
		this.toggleCompleted = this.toggleCompleted.bind(this);
	}

	toggleCompleted() {
		// Set the checked property to the opposite of its current value
		let keyObjective = _.clone(this.props.keyObjective);
		keyObjective.completed = !keyObjective.completed;
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.KeyObjectiveCompleted, Teal.ObjectTypes.Goal,
			"teal.goals.setKeyObjective", [ keyObjective ], this.props.goal);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	}

	render() {
		var o = this.props.keyObjective;
		return (
			<li key={o._id} className="ProjectGoalKeyObjective">
				<input id={o._id} type="checkbox" readOnly={true} checked={o.completed} onClick={this.toggleCompleted}/>
				<label htmlFor={o._id}>{o.name}</label>
			</li>
		);
	}
}

GoalKeyObjective.propTypes = {
	keyObjective: React.PropTypes.object.isRequired,
		goal: React.PropTypes.object.isRequired,
};
