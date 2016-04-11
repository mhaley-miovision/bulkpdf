import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal';

class ProfileImage extends Component {
	constructor(props) {
		super(props);
	}
	render() {
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

export default createContainer((params) => {
	"use strict";

	let { url, defaultToCurrentUser } = params;
	if (!!url) {
		return { profilePhotoUrl: Teal.userPhotoUrl(url), doneLoading: true };
	} else {
		if (!!defaultToCurrentUser) {
			var handle = Meteor.subscribe("users");
			if (handle.ready() && !!Meteor.user()) {
				var usr = Meteor.users.findOne({_id: Meteor.user()._id});
				if (usr) {
					url = usr.services.google.picture;
				}
			}
			return { profilePhotoUrl: Teal.userPhotoUrl(url), doneLoading: !!url };
		} else {
			// show the blank avatar instead
			return { profilePhotoUrl: Teal.userPhotoUrl(null), doneLoading: true };
		}
	}
}, ProfileImage);
