import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
var ReactDOM = require('react-dom');
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import TealChanges from '../../../shared/TealChanges'

export default class RoleLabel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inputId: Teal.newId(),
			isEditing: false,
			newLabel: props.roleLabel.name
		};
		this.handleDeleteThisRoleLabel = this.handleDeleteThisRoleLabel.bind(this);
		this.renameThisRoleLabel = this.renameThisRoleLabel.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.handleOnEdit = this.handleOnEdit.bind(this);
		this.handleOnFocus = this.handleOnFocus.bind(this);
	}

	handleDeleteThisRoleLabel() {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.RemoveRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.removeRoleLabel", [ this.props.roleLabel._id ], this.props.role);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	}
	renameThisRoleLabel() {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.RenameRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.renameRoleLabel", [ this.props.roleLabel._id, this.state.newLabel ], this.props.roleLabel);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	}
	handleSubmit(event) {
		event.preventDefault();
		this.setState({isEditing:false});
		if (this.state.newLabel != '') {
			this.renameThisRoleLabel();
		}
	}
	handleOnBlur() {
		this.setState({isEditing:false});
	}
	handleOnChange(evt) {
		this.setState({newLabel: evt.target.value});
	}
	handleOnEdit() {
		this.setState({isEditing:true});
	}
	handleOnFocus() {
		this.moveCaretToEnd.bind(this)();
	}
	moveCaretToEnd() {
		var el = $('#' + this.state.inputId)[0];
		if (typeof el.selectionStart === 'number') {
			el.selectionStart = el.selectionEnd = el.value.length;
		} else if (typeof el.createTextRange !== 'undefined') {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
	}

	render() {
		if (this.state.isEditing) {
			return (
				<li className="collection-item">
					<form onSubmit={this.handleSubmit}>
						<input placeholder="Enter a new label"
							   id={this.state.inputId}
							   type="text"
							   className="validate"
							   autoFocus
							   onFocus={this.handleOnFocus}
							   onBlur={this.handleOnBlur}
							   onChange={this.handleOnChange}
							   value={this.state.newLabel}
						/>
					</form>
				</li>
			);
		} else {
			return (
				<li className="collection-item">
					{this.props.roleLabel.name}
					<i className="waves-effect waves-teal itemEditingIcons tiny material-icons right grey-text" onClick={this.handleOnEdit}>edit</i>
					<i className="waves-effect waves-teal itemEditingIcons tiny material-icons right grey-text" onClick={this.handleDeleteThisRoleLabel}>delete</i>
				</li>
			);
		}
	}
}

RoleLabel.propTypes = {
	// This component gets the task to display through a React prop.
	// We can use propTypes to indicate it is required
	roleLabel: React.PropTypes.object.isRequired,
};

