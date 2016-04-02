import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './components/accounts/AccountsUIWrapper.jsx';

import { TasksCollection } from '../api/tasks'
import Teal from '../shared/Teal'
import Permissions from '../api/permissions';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Represents the whole app
class App extends Component {
	render() {
		return (
			<div>This is a test</div>
		);
	}
}

App.propTypes = {
	tasks: React.PropTypes.array.isRequired,
};

export default createContainer((view) => {
	return {
		tasks: TasksCollection.find({}).fetch(),
		loggingIn: Meteor.loggingIn(),
		hasUser: !!Meteor.user() && Permissions.isEnabled(),
		view: view,

		isPublic( route ) {
			let publicRoutes = [
				'login'
			];

			return publicRoutes.indexOf( route ) > -1;
		},

		canView() {
			return this.isPublic( FlowRouter.current().route.name ) || !!Meteor.user();
		}
	};
}, App);
