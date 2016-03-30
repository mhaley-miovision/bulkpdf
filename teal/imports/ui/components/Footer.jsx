import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import FeedbackComponent from './Feedback.jsx';

export default class Footer extends Component {
	handleFeedbackClick() {
		this.refs.feedback.showDialog();
	}

	renderContent() {
		if (this.props.hasUser) {
			return (
				<div className="container ">
					<br />

					<FeedbackComponent modalId="feedbackModal" ref="feedback"/>

					<div className="col l6 s12">
						<h5 className="white-text">Help us develop this software</h5>
						<p className="grey-text text-lighten-4">"Your feedback can help us build this software
							to serve our organization as we scale. Please assist us by reporting bugs,
							suggesting features, or just letting us know how we're doing" - Vic</p>
					</div>
					<div className="col l4 offset-l2 s12">
						<button className="btn waves-effect waves-light lighten-3 center background-main1"
								onClick={this.handleFeedbackClick}>Provide Feedback
						</button>
					</div>

					<br />
				</div>
			);
		} else {
			return (
				<div className="container">
					<br />
					<br />
					<br />
				</div>
			);
		}
	}

	render() {
		return (
			<footer className="background-main2">
				{this.renderContent()}
			</footer>
		);
	}
}
