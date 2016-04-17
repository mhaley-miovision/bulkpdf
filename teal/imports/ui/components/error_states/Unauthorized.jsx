import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class Unauthorized extends Component {
	render() {
		return (
			<div className="container centeredCard center">
				<div className="card white">
					<div className="card-content teal-text">
						Sorry, but you are not authorized to view this content.
					</div>
				</div>
			</div>
		);
	}
}
