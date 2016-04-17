import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
var ReactTooltip = require("react-tooltip")

import ControlIconButton from '../../ControlButtonIcon.jsx'

export default class GoalControls extends Component {
	constructor(props) {
		super(props);
		// normally we don't ever update props, but this is a special case for binding purposes only
		props.onCancelClicked = props.onCancelClicked.bind(this);
		props.onSaveClicked = props.onSaveClicked.bind(this);
		props.onDeleteClicked = props.onDeleteClicked.bind(this);
		props.onEditClicked = props.onEditClicked.bind(this);
		props.onSubgoalsClicked = props.onSubgoalsClicked.bind(this);
		props.onCommentsClicked = props.onCommentsClicked.bind(this);
	}
	tipId() {
		return "ct_" + this.props.goal._id;
	}
	render() {
		if (this.props.isEditing) {
			return (
				<div className="card-action center-align">
					<ControlIconButton onClicked={this.props.onCancelClicked} icon="close" tip="Cancel" tipId={this.tipId()}/>
					<ControlIconButton onClicked={this.props.onSaveClicked} icon="check" tip="Save" tipId={this.tipId()}/>
					<ReactTooltip id={this.tipId()} place="bottom"/>
				</div>
			);
		} else {
			return (
				<div className="card-action">
					<div className="center-align">
						{  this.props.goal.isLeaf ?
							<ControlIconButton onClicked={this.props.onDeleteClicked}
											   icon="delete" tip="Delete goal" tipId={this.tipId()}/>
							: ''
						}
						<ControlIconButton onClicked={this.props.onEditClicked}
										   icon="edit" tip="Edit goal" tipId={this.tipId()}/>

						{	this.props.goal.isLeaf ? '' :
							<ControlIconButton onClicked={this.props.onSubgoalsClicked}
											   icon="list" tip="List subgoals" tipId={this.tipId()}/>
						}
						<ControlIconButton onClicked={this.props.onNewClicked}
										   icon="add" tip="Add subgoal" tipId={this.tipId()}/>

						<ControlIconButton countBadgeValue={this.props.commentCount}
										   onClicked={this.props.onCommentsClicked}
										   icon="comment" tip="Comments" tipId={this.tipId()}/>
						<ReactTooltip id={this.tipId()} place="bottom"/>
					</div>
				</div>
			);
		}
	}
}

GoalControls.propTypes = {
	goal : React.PropTypes.object.isRequired,
	isEditing: React.PropTypes.bool.isRequired,
	onNewClicked: React.PropTypes.func.isRequired,
	onSubgoalsClicked: React.PropTypes.func.isRequired,
	onEditClicked: React.PropTypes.func.isRequired,
	onSaveClicked: React.PropTypes.func.isRequired,
	onCancelClicked: React.PropTypes.func.isRequired,
	onDeleteClicked: React.PropTypes.func.isRequired,
	onCommentsClicked: React.PropTypes.func.isRequired,
	commentCount: React.PropTypes.number,
};