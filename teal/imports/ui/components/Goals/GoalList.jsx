import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import Goal from './Goal.jsx'

export default class GoalList extends Component {

	renderGoals() {
		return this.props.goalList.map(goal => {
			return <Goal
				key={goal._id}
				goal={goal}
				compactViewMode={this.props.compactViewMode}
				onGoalClicked={this.props.onGoalClicked}/>;
		});
	}
	render() {
		return (
			<div className={ this.props.compactViewMode ? 'collection GoalList' : ' GoalList' } style={{ margin: 0 }}>
				{this.renderGoals()}
			</div>
		);
	}
}

GoalList.propTypes = {
	goalList: React.PropTypes.array.isRequired,
	compactViewMode: React.PropTypes.bool,
	onGoalClicked: React.PropTypes.func,
};
