import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

import Teal from '../../../shared/Teal'

import GoalList from './GoalList.jsx'
import ControlIconButton from '../ControlButtonIcon.jsx'

export default class GoalListModal extends Component {
	constructor() {
		super();
		this.handleClose = this.handleClose.bind(this);
		this.handleGoalClicked = this.handleGoalClicked.bind(this);
		this.state = {
			modalIsOpen: false
		}
	}

	// This method is exposed as an API
	openModal() {
		this.setState({modalIsOpen:true});
	}
	handleClose() {
		this.setState({modalIsOpen:false});
	}
	handleGoalClicked(evt) {
		this.handleClose();
		let id = evt.currentTarget.id;
		let url = FlowRouter.path("goalById", {goalId:id}, {showBackButton:true});
		FlowRouter.go(url);
	}

	render() {
		return (
			this.state.modalIsOpen &&
			<ModalContainer onClose={this.handleClose}>
				<ModalDialog onClose={this.handleClose}>
					<div style={{padding:0}}>
						<GoalList goalList={this.props.goalList}
								  compactViewMode={true}
								  onGoalClicked={this.handleGoalClicked}/>
					</div>
					<br/>
					<div className="center">
						<ControlIconButton onClicked={this.handleClose} icon="check"/>
					</div>
				</ModalDialog>
			</ModalContainer>
		);
	}
}

GoalListModal.propTypes = {
	goalList: React.PropTypes.array.isRequired,
	id: React.PropTypes.string.isRequired,
};
