import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import TealChanges from '../../../shared/TealChanges'

export default class GoalDoneCriterion extends Compoent {
	constructor() {
		super();
		this.toggleCompleted = this.toggleCompleted.bind(this);
	}

	toggleCompleted() {
		// Set the checked property to the opposite of its current value
		let doneCriterion = _.clone(this.props.doneCriterion);
		doneCriterion.completed = !doneCriterion.completed;
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.DoneCriteriaCompleted, Teal.ObjectTypes.Goal,
			"teal.goals.setDoneCriterion", [ doneCriterion ], this.props.goal);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	}

	render() {
		let o = this.props.doneCriterion;
		return (
			<li key={o._id} className="ProjectGoalKeyObjective">
				<input id={o._id} type="checkbox" readOnly={true} checked={o.completed} onClick={this.toggleCompleted}/>
				<label htmlFor={o._id}>{o.name}</label>
			</li>
		);
	}
}

GoalDoneCriterion.propTypes = {
	doneCriterion : React.PropTypes.object.isRequired,
		goal: React.PropTypes.object.isRequired,
};
