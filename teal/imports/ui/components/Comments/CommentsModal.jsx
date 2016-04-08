import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
var ReactTooltip = require("react-tooltip")

import Teal from '../../../shared/Teal'

import CommentsList from './CommentsList.jsx'
import ControlIconButton from '../ControlButtonIcon.jsx'

export default class CommentsModal extends Component {
	constructor(props) {
		super(props);
		this.state = { showAddInput: true };
		this.handleDismiss = this.handleDismiss.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	getId() {
		return this.props.objectId + "_comments";
	}
	getTipId() {
		return this.props.objectId + "_tip";
	}

	handleDismiss() {
		$('#' + this.getId()).closeModal();
	}

	handleDelete() {
		Meteor.call("teal.comments.clear", this.props.objectId, this.props.objectType);
		$('#' + this.getId()).closeModal();
	}

	openModal() {
		$('#' + this.getId()).openModal();
		this.refs.commentsList.initialize();
	}

	render() {
		return (
			<div id={this.getId()} className="modal modal-fixed-footer" style={{maxWidth:600}}>
				<div className="modal-content" style={{padding:0}}>
					<CommentsList
						ref="commentsList"
						comments={this.props.comments}
						objectId={this.props.objectId}
						objectType={this.props.objectType}
						showAddInput={this.state.showAddInput}/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<ControlIconButton onClicked={this.handleDelete} icon="delete"/>
						<ControlIconButton onClicked={this.handleDismiss} icon="check"/>
					</div>
					<ReactTooltip id={this.getTipId()}/>
				</div>
			</div>
		);
	}
}

CommentsModal.propTypes = {
	comments: React.PropTypes.array.isRequired,
	title: React.PropTypes.string,
	objectId: React.PropTypes.string.isRequired,
	objectType: React.PropTypes.string.isRequired
};
