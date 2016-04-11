import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import Teal from '../../../shared/Teal'

import { ContributorsCollection } from '../../../api/contributors'

import ImportPanel from './ImportPanel.jsx'
import Unauthorized from '../error_states/Unauthorized.jsx'
import Tabs from '../Tabs.jsx'

class Admin extends Component {
	constructor(props) {
		super(props);
		this.handleImportPanelResult = this.handleImportPanelResult.bind(this);
		this.handleUsersToAddChecked = this.handleUsersToAddChecked.bind(this);
		this.state = {
			unknownUsersList: [],
			usersToAddList: []
		}
	}
	handleImportPanelResult(err, data) {
		// TODO: note: this might have to be rendered in settimeout if within render cycle, revisit if needed
		if (data && data.length >= 0) {
			// the result from this call is the unknown list of users, so render that in the UI
			this.setState({unknownUsersList: data});
		}
	}
	handleUsersToAddChecked(evt) {
		console.log(evt);
		if (evt && evt.currentTarget.id) {
			// is in list? unchecked means remove
			if (_.indexOf( this.state.usersToAddList, evt.currentTarget.id ) >= 0) {
				if (!evt.currentTarget.checked) {
					// remove from list
					this.state.usersToAddList = _.reject(this.state.usersToAddList, (x) => { return x === evt.currentTarget.id; });
				}
			} else if (evt.currentTarget.checked) { // not in list, checked means should add
				this.state.usersToAddList.push( evt.currentTarget.id )
			}
		}
	}

	renderUnknownUserListItems() {
		return this.state.unknownUsersList.map(u => {
			return (
				<div className="row valign-wrapper" key={Teal.newId()}>
					<div className="col s4 m2 offset-m2 valign" key={Teal.newId()}>
						{u.name}
					</div>
					<div className="col s4 m2 valign" key={Teal.newId()}>
						{u.email}
					</div>
					<div className="col s4 m2 valign" key={u.email}>
						<p>
							<input
								id={u.email}
								type="checkbox"
								onClick={this.handleUsersToAddChecked}/>
							<label htmlFor={u.email}></label>
						</p>
					</div>
				</div>
			);
		})
	}
	renderUnknownUsersList() {
		if (this.state.unknownUsersList.length > 0) {
			return (
				<div key={Teal.newId()}>
					<header>
						<h5 className="center header text-main1" key={Teal.newId()}>Unrecognized Users</h5>
					</header>
					<br/>
					<div className="row valign-wrapper">
						<div className="col s4 m2 offset-m2 text-main1 valign" key={Teal.newId()}>
							Full Name
						</div>
						<div className="col s4 m2 text-main1 valign" key={Teal.newId()}>
							Email
						</div>
						<div className="col s4 m2 text-main3 valign" key={Teal.newId()}>
							Add Next Import?
						</div>
					</div>
					{this.renderUnknownUserListItems()}
				</div>
			);
		}
	}
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
										 resultHandler={this.handleImportPanelResult}
										 method="teal.import.importUserPhotoInfo"
										 importParams={{contributorsToAdd: this.state.usersToAddList}}/>
						</div>
					</div>
					{this.renderUnknownUsersList()}
					<br/>
					<br/>
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
