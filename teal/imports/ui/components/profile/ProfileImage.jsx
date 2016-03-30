import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal';

class ProfileImage extends Component {
	constructor() {
		super();

		this.props = {
			width: '32px',
			height: '32px',
			verticalAlign: 'middle',
			textAlign: 'center',
			//WebkitFilter: 'opacity(50%)',
			photoUrl: null
		};
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

		return (
			<img style={divStyle} className="profileImg" src={this.props.profilePhotoUrl}/>
		);
	}
}

export default createContainer((profilePhotoUrl) => {
	"use strict";

	var handle = Meteor.subscribe("users");
	if (!handle.ready()) {
		var usr = Meteor.users.findOne({ _id : Meteor.user()._id });
		console.log("usr:");
		console.log(usr);

		if (usr && usr.services) {
			return { profilePhotoUrl: usr.services.google.picture };
		}
	}
	return { profilePhotoUrl: Teal.userPhotoUrl(null) };
}, ProfileImage);
