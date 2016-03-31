import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'

// Role component - represents a single role
class GoalById extends Component {
	goBack() {
		history.back();
	}
	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<div className="section center">
						{this.props.showBackButton ?
							<ControlIconButton onClicked={this.goBack.bind(this)}
											   icon="undo" tip="Up to parent goal"/>
							: ''}
					</div>
					<div className="divider"></div>
					<div className="section">
						{this.data.goal ? <Goal goal={this.data.goal}/> : <NotFound/>}
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

export default createContainer(() => {
	"use strict";

	let handle = Meteor.subscribe("teal.goals");
	if (handle.ready() && !!this.props.goalId) {
		// all immediate children of this goal
		let goal = GoalsCollection.findOne({_id: this.props.goalId});
		return { doneLoading : true, goal:goal };
	} else {
		return { doneLoading : false };
	}
});

