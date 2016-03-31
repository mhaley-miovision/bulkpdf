import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import TealChanges from '../../../shared/TealChanges'
import TealFactory from '../../../shared/TealFactory'

export default class RoleEditModal extends Component() {
	constructor() {
		super();
		this.state = { role: null };
		this.handleSave = this.handleSave.bind(this);
		this.handleClose = this.handleClose.bind(this);
	}

	handleSave() {
		let inputs = this.refs.roleEdit.getInputs();

		let changeObject = TealChanges.createChangeObject(
			!!inputs._id ? TealChanges.Types.UpdateRole : TealChanges.Types.NewRole, // null ids imply new roles
			Teal.ObjectTypes.Role,
			"teal.roles.updateOrInsertRole", [
				TealFactory.createRole(
					inputs._id,
					inputs.label,
					inputs.accountabilityLevel,
					inputs.organization,
					inputs.organizationId,
					inputs.contributor,
					inputs.contributorId,
					inputs.startDate,
					inputs.endDate,
					inputs.isExternal,
					inputs.isLeadNode,
					inputs.isPrimaryAccountabilty,
					inputs.accountabilities)
			], this.props.role);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);

		this.refs.roleEdit.clearInputs();
		$('#' + this.props.id).closeModal();
	}
	handleClose() {
		this.refs.roleEdit.clearInputs();
		$('#' + this.props.id).closeModal();
	}

	show(roleId) {
		//debugger;
		if (roleId) {
			//let r = RolesCollection.findOne({_id:roleId});
			//this.setState({role:r});
		} else {
			this.setState({role:null});
		}
		//this.refs.roleEdit.clearInputs();
		$('#' + this.props.id).openModal();
	}

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<RoleEdit role={this.props.role ? this.props.role : this.state.role}
							  organization={this.props.organization}
							  organizationId={this.props.organizationId}
							  ref="roleEdit"/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<ControlIconButton onClicked={this.handleClose} icon="close"/>
						<ControlIconButton onClicked={this.handleSave} icon="check"/>
					</div>
				</div>
			</div>
		);
	}
}

RoleEditModal.propTypes = {
	organization: React.PropTypes.string,
	organizationId: React.PropTypes.string,
	role: React.PropTypes.object
};
