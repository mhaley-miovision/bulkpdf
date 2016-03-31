import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'

class GoalSubGoals extends Component {
	constructor() {
		super();
		var objectId = FlowRouter.getQueryParam("objectId");
		if (objectId) {
			this.props = {
				objectId: objectId
			}
		}

	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.objectId !== this.props.objectId) {
			return true;
		}
		return false;
	}

	renderGoals() {
		if (this.props.doneLoading) {
			return <GoalList goalList={this.props.goals} compactViewMode={this.props.compactViewMode}
							 onGoalClicked={this.props.onGoalClicked}/>
		} else {
			return <div><Loading /><br/><br/></div>
		}
	}
	render() {
		if (this.props.isBlank) {
			return <div/>
		} else {
			if (this.props.compactViewMode) {
				return this.renderGoals();
			} else {
				return (
					<div>
						<br/>
						<header>
							<h5 className="center header text-main1">{this.props.doneLoading ? this.props.goalName : "..."}</h5>
						</header>
						<br/>
						{this.renderGoals()}
						<br/>
						<br/>
					</div>
				);
			}
		}
	}
}

GoalSubGoals.propTypes = {
	compactViewMode: React.PropTypes.bool,
	onGoalClicked: React.PropTypes.func,
};

export default createContainer(() => {
	"use strict";

	let handle = Meteor.subscribe("teal.goals");
	if (handle.ready()) {
		if (!!this.props.objectId) {
			// all immediate children of this goal
			let goals = GoalsCollection.find({parent: this.props.objectId}).fetch();
			let goalName = GoalsCollection.findOne({_id: this.props.objectId}, {fields: {name: 1}}).name;
			return {goals: goals, doneLoading: true, goalName: goalName};
		} else {
			return { isBlank : true };
		}
	} else {
		return { doneLoading : false };
	}
}, GoalSubGoals);
