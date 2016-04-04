import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class GoalStateControls extends Component {

	constructor(props) {
		super(props);
		this.state = {
			state: props && props.goal ? props.goal.state : 0
		};
		this.handleNotStartedClicked = this.handleNotStartedClicked.bind(this);
		this.handleInProgressClicked = this.handleInProgressClicked.bind(this);
		this.handleCompletedClicked = this.handleCompletedClicked.bind(this);
	}

	handleNotStartedClicked()  {
		this.setState({state:0});
	}
	handleInProgressClicked()  {
		this.setState({state:1});
	}
	handleCompletedClicked()  {
		this.setState({state:2});
	}

	render() {
		let classes = "waves-effect waves-light GoalStateButton ";
		let classesNotStarted = classes + (this.state.state == 0 ? "active"  : "");
		let classesInProgress = classes + (this.state.state == 1 ? "active"  : "");
		let classesCompleted = classes + (this.state.state == 2 ? "active" : "");
		return (
			<div>
				<a className={classesNotStarted} onClick={this.handleNotStartedClicked}>Not Started</a>
				<a className={classesInProgress} onClick={this.handleInProgressClicked}>In Progress</a>
				<a className={classesCompleted} onClick={this.handleCompletedClicked}>Complete</a>
			</div>
		);
	}
}

GoalStateControls.propTypes = {
	goal: React.PropTypes.object
};

