import { Meteor } from 'meteor/meteor';
import React, {Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import TealChanges from '../../../shared/TealChanges'

import Collections from '../../../api/collections'

import Loading from '../Loading.jsx'
import RoleLabel from './RoleLabel.jsx'

class RoleLabels extends Component {
	constructor() {
		super();
		this.state = { newLabel: '' };
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		const text = this.refs.textInput.value.trim();

		let changeObject = TealChanges.createChangeObject(TealChanges.Types.NewRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.addRoleLabel", [text]);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);

		this.refs.textInput.value = "";
	}

	handleNewLabelChange(e) {
		console.log(e.target.value);
		console.log(this);
		this.setState({newLabel: e.target.value});
		console.log(this.state);
	}

	renderRoleLabels() {
		return this.props.roleLabels.map((roleLabel) => {
			return <RoleLabel
				key={roleLabel._id}
				roleLabel={roleLabel}/>;
		});
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
				<br/>

				<header>
					<h5 className="center header text-main1">Role Labels</h5>
				</header>

				{
					this.props.currentUser ?
						<form className="new-task" onSubmit={this.handleSubmit}>
							<input
								type="text"
								ref="textInput"
								placeholder="Type to add new role labels... (enter to submit)"
								onChange={this.handleNewLabelChange.bind(this)}/>
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
		var roleLabels = Collections.RoleLabels.find({}, {sort: {name: 1}}).fetch();
		return {
			roleLabels: roleLabels,
			currentUser: Meteor.user(),
			doneLoading:true
		};
	} else {
		return { doneLoading:false };
	}
}, RoleLabels);
