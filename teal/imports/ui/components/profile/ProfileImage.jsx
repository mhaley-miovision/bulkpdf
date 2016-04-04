import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal';

class ProfileImage extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		if (!Meteor.userId()) {
			return "";
		}
		var divStyle = {
			maxWidth: this.props.width,
			maxHeight: this.props.height,
			borderRadius: '50%',
			verticalAlign: 'middle',
			margin: '15px',
			WebkitFilter: this.props.WebkitFilter,
			textAlign: this.props.textAlign
		};

		if (this.props.doneLoading) {
			return (
				<img style={divStyle} className="profileImg" src={this.props.profilePhotoUrl}/>
			);
		} else {
			return false;
		}
	}
}

ProfileImage.defaultProps = {
	width: '32px',
	height: '32px',
	verticalAlign: 'middle',
	textAlign: 'center',
	//WebkitFilter: 'opacity(50%)',
	photoUrl: null
};

export default createContainer(() => {
	"use strict";

	var handle = Meteor.subscribe("teal.user_data");
	if (handle.ready()) {
		var usr = Meteor.users.findOne({ _id : Meteor.user()._id });
		if (usr && usr.services) {
			return { doneLoading: true, profilePhotoUrl: usr.services.google.picture };
		}
	}
	return { doneLoading: false, profilePhotoUrl: Teal.userPhotoUrl(null) };
}, ProfileImage);
