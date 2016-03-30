import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class FeedbackComponent  extends Component {
	constructor() {
		super();
		this.state = {
			feedback: null,
			submitted: false
		};
	}

	showDialog() {
		$('#' + this.props.modalId).openModal();
		if (this.refs && this.refs.feedback) {
			this.refs.feedback.focus();
		}
	}

	handleChange(event) {
		this.setState({feedback: event.target.value});
	}

	handleSubmit(event) {
		if (event) {
			event.preventDefault();
		}
		if (this.state.feedback != null && !this.state.submitted) {
			$('#' + this.props.modalId).closeModal();
			Meteor.call("teal.feedback.submitFeedback", this.state.feedback);
			this.state.submitted = true;
			Materialize.toast("Thank you for your feedback. Keep letting us know how we're doing!", 3000);
		}
	}

	render() {
		return (
			<div>
				<div id={this.props.modalId} className="modal">
					<div className="modal-content">
						<p>Please help us improve this tool by providing us with feedback.</p>
						<form onSubmit={this.handleSubmit}>
							<input autofocus placeholder="Provide your feedback here." id="feedback" ref="feedback"
								   type="text"
								   className="validate" onChange={this.handleChange}/>
						</form>
					</div>
					<div className="modal-footer">
						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn"
						   onClick={this.handleSubmit}>Submit</a>
						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
					</div>
				</div>
			</div>
		);
	}
}
