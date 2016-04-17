import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { RolesCollection } from '../../../api/roles'
import { GoalsCollection } from '../../../api/goals'

import GoalList from './GoalList.jsx'
import Loading from '../Loading.jsx'

class GoalsForOrganization extends Component {
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

GoalsForOrganization.propTypes = {
	orgId: React.PropTypes.string.isRequired
};

export default createContainer((params) => {
	"use strict";

	const { orgId } = params;

	let handle = Meteor.subscribe("teal.goals");
	if (handle.ready()) {
		// find all goals that have a role that is contained in this organization as an owner or contributor owner, sorted by depth


		let roleIds = RolesCollection.find(
			{ organizationId: orgId}, {sort: {depth:1}, fields: { _id:1 }}).map(r => {return r._id});

		// find all goals with these role as owners or contributors, sorted by depth
		let goals = GoalsCollection.find({$or: [
			{ ownerRoles: { $elemMatch : { _id: {$in: roleIds} }}},
			{ contributorRoles: { $elemMatch : { _id: {$in: roleIds} }}}
		]}, {sort: {depth:1}}).fetch();

		let i = 0;
		while (i < goals.length) {
			let g = goals[i];
			if (g.depth === 0) {
				goals.splice(j, 1);
				continue;
			}
			// remove all sub children, i.e. that contain this id in their path
			let j = i+1;
			while (j < goals.length) {
				if (goals[j].path.indexOf(g._id) >= 0) {
					goals.splice(j, 1);
				} else {
					j++; // only increment if we didn't remove the element
				}
			}
			// next top level node
			i++;
		}
		return { goals: goals, doneLoading: true };
	} else {
		return { doneLoading : false };
	}
}, GoalsForOrganization);