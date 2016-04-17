import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class NotFound extends Component {
	render() {
		return (
			<div className="container centeredCard center">
				<div className="card white">
					<div className="card-content teal-text">
						The content you are looking for was not found.
					</div>
				</div>
			</div>
		);
	}
}


