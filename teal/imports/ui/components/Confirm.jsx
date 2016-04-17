import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Teal from '../../shared/Teal'

class ConfirmModal extends Component {

	constructor(props) {
		super(props);
		this.handleConfirm = this.handleConfirm.bind(this);
		this.handleDismiss = this.handleDismiss.bind(this);
	}

	handleDismiss() {
		$('#' + this.props.id).closeModal();
		this.promise.reject();
	}
	handleConfirm() {
		$('#' + this.props.id).closeModal();
		this.promise.resolve();
	}

	openModal() {
		$('#' + this.props.id).openModal({
				dismissible: false,
				opacity: .5, // Opacity of modal background
				in_duration: 300, // Transition in duration
				out_duration: 200, // Transition out duration
			}
		);
	}

	componentDidMount() {
		this.promise = new $.Deferred();
		this.openModal();
	}

	render() {
		let dangerText = this.props.dangerText ? (<span className="red-text"> {this.props.dangerText}</span>) : null;
		return (
			<div id={this.props.id} className="modal">
				<div className="modal-content">
					<h4>{this.props.question}</h4>
					<p>{this.props.explanation} {dangerText}</p>
				</div>
				<div className="modal-footer">
					<a onClick={this.handleDismiss} className="modal-action modal-close waves-effect waves-green btn-flat">{this.props.dismissText}</a>
					<a onClick={this.handleConfirm} className={"modal-action modal-close waves-effect waves-green btn " + (this.props.dangerText ? 'red' : 'orange')}>{this.props.confirmText}</a>
				</div>
			</div>
		);
	}
}

ConfirmModal.propTypes = {
	confirmText: React.PropTypes.string,
	dismissText: React.PropTypes.string,
	title: React.PropTypes.string,
	question: React.PropTypes.string,
	dangerText: React.PropTypes.string,
	id: React.PropTypes.string
};

ConfirmModal.defaultProps = {
	question: 'Are you sure?',
	dangerText: '',
	explanation: '',
	confirmText: 'Yes',
	dismissText: 'No',
	id: Teal.newId()
};

export default function(explanation = '', question, dangerText, options) {
	var cleanup, component, props, wrapper;
	if (options == null) {
		options = {};
	}
	props = $.extend({
		question: question,
		explanation: explanation,
		dangerText: dangerText
	}, options);
	wrapper = document.body.appendChild(document.createElement('div'));
	component = ReactDOM.render(<ConfirmModal {...props}/>, wrapper);
	cleanup = function() {
		ReactDOM.unmountComponentAtNode(wrapper);
		return setTimeout(function() {
			return wrapper.remove();
		}, 0);
	};
	return component.promise.always(cleanup).promise();
};
