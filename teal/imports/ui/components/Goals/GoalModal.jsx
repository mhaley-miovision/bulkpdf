import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Goal from './Goal.jsx'
import ControlIconButton from '../ControlButtonIcon.jsx'

export default class GoalModal extends Component {
	constructor() {
		super();
		this.handleClose = this.handleClose.bind(this);
	}

	handleClose() {
		$('#' + this.props.id).closeModal();
	}

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<Goal goal={this.props.goal} hideControls={this.props.hideControls}/>
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

GoalModal.propTypes = {
	id: React.PropTypes.string.isRequired,
	goal: React.PropTypes.object.isRequired,
	hideControls: React.PropTypes.bool,
};
