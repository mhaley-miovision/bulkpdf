import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { FlowRouter } from 'meteor/kadira:flow-router'

import GoalSubGoals from './GoalSubGoals.jsx'
import ControlIconButton from '../ControlButtonIcon.jsx'



export default class SubGoalsModal extends Component {
	constructor(props) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
		this.handleGoalClicked = this.handleGoalClicked.bind(this);
		console.log("SubGoalsModal.constructor");
		console.log(props);
	}

	handleClose() {
		$('#' + this.props.id).closeModal();
	}
	handleGoalClicked(evt) {
		this.handleClose();
		let id = evt.currentTarget.id;
		let url = FlowRouter.path("goalById", {goalId:id}, {showBackButton:true});
		FlowRouter.go(url);
	}

	render() {
		console.log("SubGoalsModal.render");
		console.log(this.props);
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<GoalSubGoals objectId={this.props.parentGoalId}
								  compactViewMode={true}
								  onGoalClicked={this.handleGoalClicked}/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<ControlIconButton onClicked={this.handleClose} icon="check"/>
					</div>
				</div>
			</div>
		);
	}
}

SubGoalsModal.propTypes = {
	parentGoalId: React.PropTypes.string.isRequired,
	id: React.PropTypes.string.isRequired
};
