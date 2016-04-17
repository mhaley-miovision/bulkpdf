import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class GoalUpToParentButton extends Component {
	constructor() {
		super();
		this.goToParentGoal = this.goToParentGoal.bind(this);
	}

	goToParentGoal() {
		let url = FlowRouter.path("goalById", {goalId: this.props.goal.parent}, {});
		FlowRouter.go(url);
	}

	render() {
		// parent is a root goal
		if (this.props.goal.parent === this.props.goal.rootGoalId) {
			return <span data-tip="Top level goal" className="ProjectTag valign">{this.props.goal.rootGoalName}</span>
		} else {
			return <i style={{fontSize:"23px",padding:0}} className="material-icons GreyButtonSmall"
					  data-tip="Go to parent goal" onClick={this.goToParentGoal}>arrow_upward</i>
		}
	}
}

GoalUpToParentButton.propTypes = {
	goal : React.PropTypes.object.isRequired,
};