import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import { RolesCollection } from '../../../api/roles'
import { GoalsCollection } from '../../../api/goals'

import GoalList from './GoalList.jsx'
import Loading from '../Loading.jsx'

class GoalsForCompany extends Component {
	constructor(props) {
		super(props);
		this.handleGoalClicked = this.handleGoalClicked.bind(this);
	}

	handleGoalClicked(evt) {
		let id = evt.currentTarget.id;
		let url = FlowRouter.path("goalById", { goalId:id }, {showBackButton:true});
		FlowRouter.go(url);
	}

	renderGoals() {
		if (this.props.doneLoading) {
			return <GoalList goalList={this.props.goals} compactViewMode={true} onGoalClicked={this.handleGoalClicked}/>
		} else {
			return <div><Loading /><br/><br/></div>
		}
	}

	render() {
		return (
			<div>
				<br/>
				{this.renderGoals()}
				<br/>
				<br/>
			</div>
		);
	}
}

export default createContainer(() => {
	"use strict";

	let handle = Meteor.subscribe("teal.goals");
	if (handle.ready()) {
		// find all goals at level 1 depth

		let goals = GoalsCollection.find({ rootOrgId: Teal.rootOrgId(), depth: 1 }).fetch();

		return { goals: goals, doneLoading: true };
	} else {
		return { doneLoading : false };
	}
}, GoalsForCompany);
