import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import TealChanges from '../../../shared/TealChanges'

class RoleLabels extends Component {

	renderRoleLabels() {
		return this.props.roleLabels.map((roleLabel) => {
			const currentUserId = this.props.currentUser && this.props.currentUser.profile._id;

			return <RoleLabel
				key={roleLabel._id}
				roleLabel={roleLabel}/>;
		});
	}

	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		let changeObject = TealChanges.createChangeObject(TealChanges.Types.NewRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.addRoleLabel", [this.props.roleLabel._id, this.state.newLabel], null);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	}

	renderBody() {
		if (this.props.doneLoading) {
			return (
				<ul className="collection">
					{this.renderRoleLabels()}
				</ul>
			);
		} else {
			return <Loading />
		}
	}

	render() {
		return (
			<div className="container">
				<header>
					<h3 className="center header text-main1">Role Labels</h3>
				</header>

				{
					this.data.currentUser ?
						<form className="new-task" onSubmit={this.handleSubmit}>
							<input
								type="text"
								ref="textInput"
								placeholder="Type to add new role labels"/>
						</form> : ''
				}

				{this.renderBody()}

				<br/>
				<br/>

			</div>);
	}
}

export default createContainer(() => {
	"use strict";

	var handle = Meteor.subscribe("teal.role_labels");
	if (handle.ready()) {
		var roleLabels = RoleLabelsCollection.find({}, {sort: {name: 1}}).fetch();
		return {
			roleLabels: roleLabels,
			currentUser: Meteor.user(),
			doneLoading:true,
		};
	} else {
		return { doneLoading:false };
	}
}, RoleLabels);
