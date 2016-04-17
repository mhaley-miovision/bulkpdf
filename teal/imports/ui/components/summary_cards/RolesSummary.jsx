import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import { RolesCollection } from '../../../api/roles'

import Loading from '../Loading.jsx'
import RoleEditModal from '../roles/RoleEditModal.jsx'

class RolesSummary extends Component {
	constructor(props) {
		super(props);
		this.handleRoleEditOnClicked = this.handleRoleEditOnClicked.bind(this);
	}

	notImplemented() {
		Materialize.toast( "Not implemented yet, stay tuned!", 1000);
	}

	handleRoleEditOnClicked(e) {
		console.log(this.refs);
		console.log('m'+e.currentTarget.id);
		this.refs['m'+e.currentTarget.id].show();
	}

	renderRolesControls(r) {
		let controls = [];
		var url1 = FlowRouter.path("organizationView", {}, {objectId: r.organizationId, zoomTo: r._id, showBackButton:true});

		// public controls
		controls.push(
			<a key={r._id+"1"} href={url1} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">search</i>
			</a>
		);

		// private controls
		// TODO: check for permissions here

		// edit
		controls.push(
			<a key={r._id+"4"} id={r._id} onClick={this.handleRoleEditOnClicked} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">edit</i>
			</a>
		);

		/*
		controls.push(
			<a key={r._id+"2"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_down</i>
			</a>
		);
		controls.push(
			<a key={r._id+"3"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_up</i>
			</a>
		);
		*/

		return controls;
	}

	renderRoles() {
		if (this.props.doneLoading) {
			return this.props.roles.map(r => {
				return (
					<li className="collection-item" key={r._id}>
						<div className="collection-item-text">
							{r.label}, {r.organization}
						</div>
						{this.renderRolesControls(r)}
					</li>
				);
			});
		}
	}

	renderModals() {
		if (this.props.doneLoading) {
			return this.props.roles.map(r => {
				return <RoleEditModal key={r._id} role={r} ref={'m'+r._id} id={'m'+r._id}/>
			});
		}
		return false;
	}

	render() {
		if (this.props.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader" key={_.escape(this.props.email)+"_roles"}>
							Roles
						</li>
						{this.renderRoles()}
					</ul>
					{this.renderModals()}
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
}

RolesSummary.propTypes = {
	objectId: React.PropTypes.string.isRequired,
};

export default createContainer((params) => {
	"use strict";

	let handle = Meteor.subscribe("teal.roles");

	const { objectId } = params;

	if (handle.ready()) {
		let roles = RolesCollection.find({email:objectId}).fetch();
		return { doneLoading: true, roles: roles }
	} else {
		return { doneLoading: false };
	}
}, RolesSummary);