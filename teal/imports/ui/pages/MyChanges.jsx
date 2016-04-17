import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Changes from '../components/changes/Changes.jsx'

export default class MyProfile extends Component {
	render() {
		return <Changes />
	}
}
