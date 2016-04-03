import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

class TaskList extends Component {
	constructor() {
		super();
		this.state = {
			hideCompleted: false
		};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	renderTasks() {
		// Get tasks from this.data.tasks
		return this.data.tasks.map((task) => {
			const currentUserId = this.data.currentUser && this.data.currentUser.profile._id;
			const showPrivateButton = task.owner === currentUserId;

			return <Task
				key={task._id}
				task={task}
				showPrivateButton={showPrivateButton}/>;
		});
	}
	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		Meteor.call("teal.tasks.addTask", text);

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	}
	toggleHideCompleted() {
		this.setState({
			hideCompleted: !this.state.hideCompleted
		});
	}

	render() {
		return (
			<div>

				<br/>
				<header>
					<h3 className="center header text-main1">My Tasks</h3>
				</header>

				<label className="btn-small">
					<input
						type="checkbox"
						readOnly={true}
						checked={this.state.hideCompleted}
						onClick={this.toggleHideCompleted}/>
					Hide Completed Tasks
				</label>

				{ this.data.currentUser ?
					<form className="new-task" onSubmit={this.handleSubmit}>
						<input
							type="text"
							ref="textInput"
							placeholder="Type to add new tasks"/>
					</form> : ''
				}

				<ul className="collection">
					{this.renderTasks()}
				</ul>
			</div>
		)
	}
}

export default createContainer(() => {
	"use strict";

	Meteor.subscribe("teal.tasks");

	let query = {};

	if (this.state.hideCompleted) {
		// If hide completed is checked, filter tasks
		query = {checked: {$ne: true}};
	}

	return {
		tasks: TasksCollection.find(query, {sort: {createdAt: -1}}).fetch(),
		incompleteCount: TasksCollection.find({checked: {$ne: true}}).count(),
		currentUser: Meteor.user()
	}
}, TaskList);
