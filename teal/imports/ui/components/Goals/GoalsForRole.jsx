import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'

import GoalList from './GoalList.jsx'
import Loading from '../Loading.jsx'

class GoalsForRole extends Component {

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.objectId !== this.props.objectId) {
			return true;
		}
		return false;
	}

	renderGoals() {
		if (this.props.doneLoading) {
			if (this.props.notFound) {
				return <NotFound/>
			}
			return <GoalList goalList={this.props.goals}/>
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

GoalsForRole.propTypes = {
	objectId:React.PropTypes.string.isRequired,
};

export default createContainer(() => {
	"use strict";

	let handle = Meteor.subscribe("teal.roles");
	let handle2 = Meteor.subscribe("teal.goals");
	if (handle.ready() && handle2.ready()) {
		let role = RolesCollection.findOne({_id:this.props.objectId});
		if (!role) {
			return { doneLoading: true, notFound: true }
		}
		let goals = GoalsCollection.find({_id: { $in : role.topGoals }});
		if (!goals) {
			return { doneLoading: true, notFound: true }
		}
		return { goals: goals, doneLoading: true };
	} else {
		return { doneLoading : false };
	}
}, GoalsForRole);
