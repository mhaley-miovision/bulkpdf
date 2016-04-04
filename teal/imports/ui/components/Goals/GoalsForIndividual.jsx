import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router'
import { createContainer } from 'meteor/react-meteor-data';

import { GoalsCollection } from '../../../api/goals'
import { RolesCollection } from '../../../api/roles'
import { ContributorsCollection } from '../../../api/contributors'

import Loading from '../Loading.jsx'
import GoalList from './GoalList.jsx'

class GoalsForIndividual extends Component {
	constructor(props) {
		super(props);
		this.state = { contributorPrefix: "My " };
		var objectId = FlowRouter.getQueryParam("objectId");
		if (objectId) {
			this.props.objectId = objectId;
		}
	}
	shouldComponentUpdate(nextProps, nextState) {
		/*
		if (nextProps.objectId !== this.props.objectId) {
			return true;
		}
		return false;
		 */
		return true;
	}
	renderGoals() {
		console.log(this.props.doneLoading);
		if (this.props.doneLoading) {
			return <GoalList goalList={ this.props.goals }/>
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

export default createContainer((objectId) => {
	"use strict";

	let handle = Meteor.subscribe("teal.goals");
	let handle2 = Meteor.subscribe("teal.contributors");

	if (handle.ready() && handle2.ready()) {
		var contributor = ContributorsCollection.findOne({email: objectId});

		// determine the title prefix
		let prefix = objectId && contributor ? contributor.name + "'s " : "My ";
		// default is current user
		if (objectId == null) {
			var myUser = Meteor.users.findOne({_id: Meteor.userId()});
			objectId = myUser.email;
		}

		let allRolesTopGoals = RolesCollection.find({email: objectId}, {fields: {topGoals: 1}}).map(x => {
			return x.topGoals
		});
		let goalIds = [];
		allRolesTopGoals.forEach(topGoalsForRole => {
			goalIds = goalIds.concat(topGoalsForRole);
		});
		let goals = GoalsCollection.find({_id: {$in: goalIds}}).fetch();

		return {  doneLoading: true, goals: goals, contributorPrefix: prefix };
	} else {
		return { doneLoading: false };
	}
}, GoalsForIndividual);
