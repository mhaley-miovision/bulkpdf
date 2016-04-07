import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { RolesCollection } from '../../api/roles'

import ImportPanel from '../components/admin/ImportPanel.jsx'
import RoleLabels from '../components/roles/RoleLabels.jsx'
import Unauthorized from '../components/error_states/Unauthorized.jsx'

class Admin extends Component {
	render() {
		if (this.props.isLoading) {
			return <Loading/>;
		} else if (this.props.isAuthorized) {
			return (
				<div>
					<br />
					<div className="container">
						<header>
							<h5 className="center header text-main1">Data Import</h5>
						</header>
						<div className="row">
							<div className="col s12 m4 offset-m4">
								<ImportPanel id="importODPanel" label="Import All Data"
											 method="teal.import.importAllData"/>
							</div>
						</div>
					</div>
					<br />
					<RoleLabels />
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
