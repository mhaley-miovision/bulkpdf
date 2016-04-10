import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { ContributorsCollection } from '../../../api/contributors'

import ImportPanel from './ImportPanel.jsx'
import Unauthorized from '../error_states/Unauthorized.jsx'
import Tabs from '../Tabs.jsx'

class Admin extends Component {
	render() {
		if (this.props.isLoading) {
			return <Loading/>;
		} else if (this.props.isAuthorized) {
			return (
				<div>
					<br />
					<header>
						<h5 className="center header text-main1">Update Users</h5>
					</header>
					<div className="row">
						<div className="col s12 m4 offset-m4">
							<ImportPanel id="importODPanel" label="Import from Google"
										 method="teal.import.importUserPhotoInfo"/>
						</div>
					</div>
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
