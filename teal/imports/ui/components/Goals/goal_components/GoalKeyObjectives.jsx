import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import GoalKeyObjective from './GoalKeyObjective.jsx'

export default class GoalKeyObjectives extends Component {
	constructor(props) {
		super(props);
	}

	renderKeyObjectivesItems() {
		let _this = this;

		return this.props.goal.keyObjectives.map(function(o,i) {
			return <GoalKeyObjective key={o._id} keyObjective={o} goal={_this.props.goal}/>;
		});
	}

	render() {
		if (this.props.goal.keyObjectives.length > 0) {
			return (
				<div>
					<div className="GoalSubtitle hide-on-small-only">Key Objectives</div>
					<div className="GoalSubtitleMobile hide-on-med-and-up center">Key Objectives</div>
					<ul className="ProjectGoalDoneCriteria">{this.renderKeyObjectivesItems()}</ul>
				</div>
			);
		} else {
			return false;
		}
	}
}

GoalKeyObjectives.propTypes = {
	goal: React.PropTypes.object.isRequired
};