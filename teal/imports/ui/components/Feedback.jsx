import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
var Modal = require('react-modal');

const MAX_INPUT_CHARS = 140;

const customStyles = {
	overlay : {
		position          : 'fixed',
		top               : 0,
		left              : 0,
		right             : 0,
		bottom            : 0,
		backgroundColor   : 'rgba(0, 0, 0, 0.75)',
		zIndex		  	  : 9000
	},
	content : {
		top                   : '50%',
		left                  : '50%',
		right                 : 'auto',
		bottom                : 'auto',
		marginRight           : '-50%',
		transform             : 'translate(-50%, -50%)'
	}
};

export default class FeedbackComponent  extends Component {
	constructor() {
		super();
		this.state = {
			modalIsOpen: false,
			feedback: null,
			submitted: false
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	openModal() {
		this.setState({feedback: '', modalIsOpen: true});
	}
	closeModal() {
		this.setState({modalIsOpen: false});
	}
	handleSubmit(event) {
		if (event) {
			event.preventDefault();
		}
		if (this.state.feedback != null && !this.state.submitted) {
			Meteor.call("teal.feedback.submitFeedback", this.state.feedback);
			Materialize.toast("Thank you for your feedback. Keep letting us know how we're doing!", 3000);
		}

		this.closeModal();
	}
	handleChange(event) {
		this.setState({feedback: event.target.value.substr(0, MAX_INPUT_CHARS)});
	}

	render() {
		return (
			<div>
				<Modal
					isOpen={this.state.modalIsOpen}
					onRequestClose={this.closeModal}
					style={customStyles}>

					<p>Please help us improve this tool by providing us with feedback.</p>
					<form onSubmit={this.handleSubmit}>
						<div class="input-field col s12">
							<textarea autofocus placeholder="Provide your feedback here." id="feedback" type="text"
								className="materialize-textarea" onChange={this.handleChange}  value={this.state.feedback}/>
						</div>
					</form>

					<div className="center">
						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn"
						   onClick={this.handleSubmit}>Submit</a>
						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat"
						   onClick={this.closeModal}>Cancel</a>
					</div>
				</Modal>
			</div>
		);
	}
}
