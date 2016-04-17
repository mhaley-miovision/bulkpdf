import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { RolesCollection } from '../../api/roles'

import Tabs from '../components/Tabs.jsx'
import ImportUsers from '../components/admin/ImportUsers.jsx'
import RoleLabels from '../components/roles/RoleLabels.jsx'
import Unauthorized from '../components/error_states/Unauthorized.jsx'

class Admin extends Component {
	constructor(props) {
		super(props);
		this.handleTabClicked = this.handleTabClicked.bind(this);
		this.state = {
			tab: 'users',
			tabItems: [
				{ id: "users", 	name: "Users" },
				{ id: "roles", 	name: "Roles" }
			]};
	}
	handleTabClicked(tabId) {
		this.setState({tab:tabId});
	}
	renderActiveTab() {
		if (this.state.tab === 'users') {
			return <ImportUsers/>;
		} else if (this.state.tab === 'roles') {
			return <RoleLabels/>;
		}
	}

	render() {
		if (this.props.isLoading) {
			return <Loading/>;
		} else if (this.props.isAuthorized) {
			return (
				<div>
					<br/>
					<div className="row">
						<div className="col m6 offset-m3 s12">
							<Tabs selectedItemId={this.state.tab} items={this.state.tabItems} onClick={this.handleTabClicked}/>
						</div>
					</div>

					{ this.renderActiveTab() }
				</div>
			);
		} else {
			return (
				<Unauthorized />
			);
		}
	}
}

export default createContainer(() => {
	"use strict";

	var u = Meteor.users.findOne(Meteor.userId);
	return {
		isAuthorized: Roles.userIsInRole(Meteor.user(), 'admin')//, u.rootOrgId)
	}
}, Admin);
