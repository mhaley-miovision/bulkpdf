import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
var ReactTooltip = require("react-tooltip")

import TealChanges from '../../../../shared/TealChanges'

export default class GoalState extends Component {
	constructor() {
		super();
		this.handleOnClick = this.handleOnClick.bind(this);
	}

	handleOnClick(evt) {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.GoalStateChanged, Teal.ObjectTypes.Goal,
			"teal.goals.setGoalState", [ this.props.goal._id, this.incrementState(this.props.goal.state) ], this.props.goal);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
		evt.stopPropagation();
	}

	incrementState(state) {
		return (state + 1) % 3;
	}

	stateToLabel(state) {
		let label = "Not Started";
		if (state == 2) {
			label = "Completed";
		} else if (state == 1) {
			label = "In Progress";
		}
		return label;
	}

	toolTipId() {
		return "gs" + this.props.goal._id;
	}

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
}

GoalState.propTypes = {
	goal: React.PropTypes.object.isRequired,
};
