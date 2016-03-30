import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './components/accounts/AccountsUIWrapper.jsx';

import { TasksCollection } from '../api/tasks'
import Teal from '../shared/Teal'
import Permissions from '../api/permissions';

import Task from './components/Task.jsx';

// Represents the whole app
class App extends Component {
	renderTasks() {
		return this.props.tasks.map((task) => (
			<Task key={task._id} task={task} />
		));
	}

	render() {
		return (
			<div className="container">

				<AccountsUIWrapper />

				<header id="test">
					<h1>Todo List</h1>
				</header>

				<ul>
					{this.renderTasks()}
				</ul>
			</div>
		);
	}
}

App.propTypes = {
	tasks: React.PropTypes.array.isRequired,
};

export default createContainer(() => {
	Meteor.subscribe('teal.tasks');
	return {
		tasks: TasksCollection.find({}).fetch(),
		loggingIn: Meteor.loggingIn(),
		hasUser: !!Meteor.user() && Permissions.isEnabled(),

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
