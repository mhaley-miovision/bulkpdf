import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { FlowRouter } from 'meteor/kadira:flow-router'

import Teal from '../../../shared/Teal'
import { GoalsCollection } from '../../../api/goals'

import Loading from '../Loading.jsx'
import GoalList from './GoalList.jsx'

class GoalSubGoals extends Component {
	constructor(props) {
		super(props);
		var objectId = FlowRouter.getQueryParam("objectId");
		if (objectId) {
			props.objectId = objectId;
		}
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
	onGoalClicked: React.PropTypes.func
};

export default createContainer((params) => {
	"use strict";

	const { objectId } = params;

	console.log("Entering createContainer, objectId: " + objectId);

	let handle = Meteor.subscribe("teal.goals");
	if (handle.ready()) {
		if (!!objectId) {
			// all immediate children of this goal
			let goals = GoalsCollection.find({parent: objectId}).fetch();
			let goalName = GoalsCollection.findOne({_id: objectId}, {fields: {name: 1}}).name;
			return { goals: goals, doneLoading: true, goalName: goalName};
		} else {
			return { doneLoading: true, isBlank: true };
		}
	} else {
		return { doneLoading : false };
	}
}, GoalSubGoals);
