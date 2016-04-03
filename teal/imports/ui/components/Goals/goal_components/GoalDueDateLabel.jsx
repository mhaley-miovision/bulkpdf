import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class GoalDueDateLabel extends Component {

	render() {
		let gd = this.props.goal.dueDate;
		let complete = this.props.goal.state == 2;
		let overdue = gd && (new Date(gd) < new Date());
		let classes = "GoalDueDate";
		if (overdue && !complete) {
			classes += " late";
		}
		return <span className={classes}>{ this.props.goal.dueDate ? this.props.goal.dueDate : ''}</span>;
	}
}

GoalDueDateLabel.propTypes = {
	goal: React.PropTypes.object.isRequired,
};
