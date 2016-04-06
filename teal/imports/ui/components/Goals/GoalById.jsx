import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
var ReactTooltip = require("react-tooltip");

import Teal from '../../../shared/Teal'

import { GoalsCollection } from '../../../api/goals'

import Loading from '../Loading.jsx'
import Goal from './Goal.jsx'
import ControlIconButton from '../ControlButtonIcon.jsx'

// Role component - represents a single role
class GoalById extends Component {
	goBack() {
		history.back();
	}
	renderBackButton() {
		if (this.props.showBackButton) {
			return <ControlIconButton onClicked={this.goBack.bind(this)} icon="undo" tip="Up to parent goal"/>;
		}
	}
	render() {
		if (this.props.doneLoading) {
			return (
				<div>
					<div className="section center">
						{ this.renderBackButton() }
					</div>
					<div className="divider"></div>
					<div className="section">
						{this.props.goal ? <Goal goal={this.props.goal}/> : <NotFound/>}
					</div>
					<ReactTooltip/>
				</div>
			)
		} else {
			return <Loading spinner={true}/>
		}
	}
}

GoalById.propTypes = {
	goalId: React.PropTypes.string.isRequired,
	showBackButton : React.PropTypes.bool
};

export default createContainer((params) => {
	"use strict";

	const { goalId } = params;

	let handle = Meteor.subscribe("teal.goals");
	if (handle.ready() && !!goalId) {
		// all immediate children of this goal
		let goal = GoalsCollection.findOne({_id: goalId});
		return { doneLoading : true, goal:goal };
	} else {
		return { doneLoading : false };
	}
}, GoalById);

