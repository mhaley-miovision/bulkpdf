import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
var ReactTooltip = require("react-tooltip")
import { createContainer } from 'meteor/react-meteor-data'

import Teal from '../../../shared/Teal'
import TealChanges from '../../../shared/TealChanges'

import RoleEditModal from '../roles/RoleEditModal.jsx'
import OrgEditModal from './OrgEditModal.jsx'
import CommentsModal from '../comments/CommentsModal.jsx'
import ControlIconButton from '../ControlButtonIcon.jsx'

export default class OrgControls extends Component {
	constructor() {
		super();
		this.state = {
			subGoalsModalVisible: false,
			subGoalsTargetId: null,
		};
		this.handleNewRole = this.handleNewRole.bind(this);
		this.handleRemoveOrg = this.handleRemoveOrg.bind(this);
		this.handleAddOrg = this.handleAddOrg.bind(this);
		this.handleEditOrg = this.handleEditOrg.bind(this);
		this.handleCommentsClicked = this.handleCommentsClicked.bind(this);
	}

	showNewGoalModal() {
		// TODO: move this to a method on the component
		$('#' + this.props.newModalId).openModal();
	}
	showSubgGoalsModal() {
		// TODO: move this to a method on the component
		$('#' + this.props.subGoalsModalId).openModal();
	}
	tipId() {
		return "ct_" + this.props.org._id;
	}

	notImplemented() {
		Materialize.toast("Not implemented yet",1000);
	}

	handleNewRole() {
		this.refs.orgNewRoleModal.show();
	}
	handleRemoveOrg() {
		console.log(this.props.org);

		let changeObject = TealChanges.createChangeObject(
			TealChanges.Types.RemoveOrganization, Teal.ObjectTypes.Organization,
			"teal.orgs.removeOrganization", [ this.props.org._id ], this.props.org);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	}
	handleAddOrg() {
		this.refs.orgNewOrgModal.show();
	}
	handleEditOrg() {
		this.refs.orgEditOrgModal.show();
	}
	handleCommentsClicked(evt) {
		if (evt) {
			console.log(evt);
			evt.preventDefault();
			evt.stopPropagation();
		}

		if (this.refs && this.refs.commentsModal) {
			this.refs.commentsModal.openModal();
		} else {
			console.error("commentsModal not mounted yet");
		}
	}

	render() {
		return (
			<div>
				<RoleEditModal id="orgNewRoleModal" ref="orgNewRoleModal"
							   organization={this.props.org.name} organizationId={this.props.org._id}/>
				<OrgEditModal id="orgNewOrgModal" ref="orgNewOrgModal"
							  parentOrg={this.props.org.name} parentOrgId={this.props.org._id}/>
				<OrgEditModal id="orgEditOrgModal" ref="orgEditOrgModal" org={this.props.org}/>
				<CommentsModal ref="commentsModal"
							   comments={this.props.org.comments ? this.props.org.comments : []}
							   objectId={this.props.org._id}
							   objectType={Teal.ObjectTypes.Organization}/>

				<div className="center">
					<ControlIconButton onClicked={this.handleRemoveOrg} icon="delete" tip="Remove organization" tipId={this.tipId()}/>
					<ControlIconButton onClicked={this.handleNewRole} icon="add" tip="Add role" tipId={this.tipId()}/>
					<ControlIconButton onClicked={this.handleAddOrg} icon="add_circle_outline" tip="Add organization" tipId={this.tipId()}/>
					<ControlIconButton onClicked={this.handleEditOrg} icon="edit" tip="Edit organization" tipId={this.tipId()}/>
					<ControlIconButton onClicked={this.handleCommentsClicked}
									   countBadgeValue={this.props.org.comments && this.props.org.comments.length > 0 ?
														 this.props.org.comments.length : null}
									   icon="comment" tip="Comments" tipId={this.tipId()}/>
					<ReactTooltip id={this.tipId()} place="bottom"/>
				</div>
			</div>
		);
	}
}

OrgControls.propTypes = {
	org : React.PropTypes.object.isRequired
};
