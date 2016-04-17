import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

class GoalTreeByGoalId extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<GoalTree goalsRoot={this.data.goalsRoot}/>
				</div>
			);
		} else {
			return <Loading />
		}
	}
}

GoalTreeByGoalId.propTypes = {
	goalId: React.PropTypes.string.isRequired
};

GoalTreeByGoalId.defaultProps = {
	searchVisible: true
};

export default createContainer(() => {
	"use strict";
	var handle = Meteor.subscribe("teal.goals");
	if (handle.ready()) {
		let goalId = this.state.objectId;

		// get the entire branch
		let goals = GoalsCollection.find({path: goalId}).fetch();

		// append children for tree accessibility
		goals.forEach(g => {
			g.children = _.where(goals, {parent: goalId});
		});

		// return the root
		let g = _.where(goals, {_id: goalId});

		return {doneLoading: true, goalsRoot: g};
	} else {
		return {doneLoading: false};
	}
}, GoalTreeByGoalId);
