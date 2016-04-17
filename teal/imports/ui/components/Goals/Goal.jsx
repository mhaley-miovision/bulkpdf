import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

var ReactTooltip = require('react-tooltip');

import Teal from '../../../shared/Teal'
import TealChanges from '../../../shared/TealChanges'
import TealFactory from '../../../shared/TealFactory'

import CommentsModal from '../comments/CommentsModal.jsx'
import GoalEdit from './GoalEdit.jsx'
import GoalNewModal from './GoalNewModal.jsx'
import SubGoalsModal from './SubGoalsModal.jsx'
import GoalUpToParentButton from './goal_components/GoalUpToParentButton.jsx'
import GoalDoneCriteria from './goal_components/GoalDoneCriteria.jsx'
import GoalKeyObjectives from './goal_components/GoalKeyObjectives.jsx'
import GoalUserPhotoList from './goal_components/GoalUserPhotoList.jsx'
import GoalState from './goal_components/GoalState.jsx'
import GoalsStatsDonut from './goal_components/GoalsStatsDonut.jsx'
import GoalDueDateLabel from './goal_components/GoalDueDateLabel.jsx'
import GoalControls from './goal_components/GoalControls.jsx'

import confirm from '../Confirm.jsx'

// Role component - represents a single role
export default class Goal extends Component {

	constructor() {
		super();
		this.state = { isEditing: false };

		this.handleEditClicked = this.handleEditClicked.bind(this);
		this.handleSaveClicked = this.handleSaveClicked.bind(this);
		this.handleCancelClicked = this.handleCancelClicked.bind(this);
		this.handleDeleteClicked = this.handleDeleteClicked.bind(this);
		this.handleNewGoalClicked = this.handleNewGoalClicked.bind(this);
		this.handleSubGoalsClicked = this.handleSubGoalsClicked.bind(this);
		this.handleCommentsClicked = this.handleCommentsClicked.bind(this);
	}

	renderRootLevelGoal() {
		return (
			<div className="row">
				<div className="col m9 s12 GoalContainer">
					<div className="RootGoalTitle">{this.props.goal.name}</div>
				</div>
			</div>
		);
	}

	renderGoalTitle() {
		let titleTags = [];
		titleTags.push(
			<div key={Teal.newId()} className="hide-on-small-only valign-wrapper">
				<span className="GoalTitle valign">{this.props.goal.name}</span>
				<GoalUpToParentButton goal={this.props.goal}/>
			</div>
		);
		titleTags.push(
			<div key={Teal.newId()} className="hide-on-med-and-up center">
				<div className="GoalTitle">{this.props.goal.name}</div>
				<GoalUpToParentButton goal={this.props.goal}/>
				<br/>
				<br/>
			</div>
		);
		return titleTags;
	}

	renderGoalBodyContents(containerClasses) {
		return (
			<div className={containerClasses}>
				<GoalDoneCriteria goal={this.props.goal}/>
				<GoalKeyObjectives goal={this.props.goal}/>
			</div>
		);
	}

	outputSmallOffsetCompactModeString(itemIndex) {
		let noContributors = this.props.goal.contributorRoles.length == 0;
		let noOwners = this.props.goal.ownerRoles.length == 0;

		// status column
		if (itemIndex == 2) {
			// no owners or contributors
			if (noContributors && noOwners) {
				return 'offset-s4';
			}
		}
		// contributors column
		if (itemIndex == 1) {
			if (noOwners) {
				return 'offset-s2';
			}
		}
		if (itemIndex == 0) {
			if (noContributors) {
				return 'offset-s2';
			}
		}
		return '';
	}

	renderGoalBody() {
		if (this.state.isEditing) {
			return <GoalEdit ref="obj"
							 goal={this.props.goal}/>
		} else {
			let numSummaryItems = 1;
			numSummaryItems += this.props.goal.ownerRoles.length > 0 ? 1 : 0;
			numSummaryItems += this.props.goal.contributorRoles.length > 0 ? 1 : 0;

			let subGoalsLabel =
				(this.props.goal.stats.completed + this.props.goal.stats.notStarted + this.props.goal.stats.inProgress)
				+ " Subgoals";

			if (this.props.compactViewMode) {
				// Render the goal body when viewing in compact mode
				return (
					<div className='' onClick={this.props.onClicked}>
						<div className="row" style={{marginBottom:0}}>

							<div className={"col m" + (12 - numSummaryItems * 2)
								+ " hide-on-small-only GoalTitleCompact" + (this.props.goal.isLeaf ? ' Leaf' : '')}>
								{this.props.goal.name}
							</div>
							<div className={"col s12 hide-on-med-and-up GoalTitleCompactMobile"
								+ (this.props.goal.isLeaf ? ' Leaf' : '')}>
								{this.props.goal.name}
							</div>

							{ this.props.goal.ownerRoles.length > 0 ?
								<div className={"col m2 s4 GoalContainerCompact center " + this.outputSmallOffsetCompactModeString(0)}>
									<GoalUserPhotoList compactViewMode={this.props.compactViewMode}
													   list={this.props.goal.ownerRoles}
													   heading="Owner"/>
								</div>
								: ''
							}
							{ this.props.goal.ownerRoles.length > 0 ?
								<div className={"col m2 s4 of GoalContainerCompact center " + this.outputSmallOffsetCompactModeString(1)}>
									<GoalUserPhotoList compactViewMode={this.props.compactViewMode}
													   list={this.props.goal.contributorRoles}
													   heading="Contributor"/>
								</div>
								: ''
							}
							<div className={"col m2 s4 GoalContainerCompact center " + this.outputSmallOffsetCompactModeString(2)}>
								<div className="GoalOwnersSection GoalSummaryHeading hide-on-small-only">{subGoalsLabel}</div>
								<div className="GoalOwnersSectionMobile GoalSummaryHeading hide-on-med-and-up">{subGoalsLabel}</div>
								<GoalState goal={this.props.goal}/>
								<br/>
								<GoalDueDateLabel goal={this.props.goal}/>
							</div>
						</div>
					</div>
				);
			} else {
				// Render the goal body when viewing in normal, card based mode
				return (
					<div className='card-content' onClick={this.props.onClicked}>
						<div className={"row " + Teal.whenNotSmall("GoalContainer")}>
							<div className={"col m9 s12"}>
								{this.renderGoalTitle()}
								{this.renderGoalBodyContents()}
							</div>
							<div className={"col m3 s12 center"}>
								<GoalUserPhotoList compactViewMode={this.props.compactViewMode}
												   list={this.props.goal.ownerRoles}
												   heading="Owner"/>
								<GoalUserPhotoList compactViewMode={this.props.compactViewMode}
												   list={this.props.goal.contributorRoles}
												   heading="Contributor"/>

								{ this.props.goal.isLeaf ? '' : <br/> }
								{ this.props.goal.isLeaf ? '' :
									<div
										className="GoalOwnersSection GoalSummaryHeading hide-on-small-only">{subGoalsLabel}</div>
								}
								{ this.props.goal.isLeaf ? '' :
									<div
										className="GoalOwnersSectionMobile GoalSummaryHeading hide-on-med-and-up">{subGoalsLabel}</div>
								}
								<GoalState goal={this.props.goal}/>
								{ this.props.goal.isLeaf ? '' :
									<GoalsStatsDonut goal={this.props.goal} width="60px" height="60px"/>
								}
								{ this.props.goal.isLeaf ? <br/> : '' }
								<GoalDueDateLabel goal={this.props.goal}/>
							</div>
						</div>
					</div>
				);
			}
		}
	}

	handleEditClicked() {
		this.setState({isEditing:true});
	}
	handleSaveClicked() {
		this.setState({isEditing:false});
		if (this.refs.obj) {
			let inputs = this.refs.obj.getInputs();
			let changeObject = TealChanges.createChangeObject(TealChanges.Types.UpdateGoal, Teal.ObjectTypes.Goal,
				"teal.goals.updateOrInsertGoal", [ TealFactory.createGoal(
					inputs._id, null, inputs.name, inputs.keyObjectives,
					inputs.doneCriteria, inputs.ownerRoles,
					inputs.contributorRoles, inputs.state, inputs.dueDate) ], this.props.goal);
			Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
		}
	}
	handleCancelClicked() {
		// reset changes made
		this.refs.obj.clearInputs();
		this.setState({isEditing:false});
	}
	handleDeleteClicked() {
		confirm("This action will permanently this goal.", "Delete goal?", "This cannot be reversed!").then(() => {
			let changeObject = TealChanges.createChangeObject(TealChanges.Types.RemoveGoal, Teal.ObjectTypes.Goal,
				"teal.goals.deleteGoal", [this.props.goal._id], this.props.goal);
			Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
		});
	}
	handleNewGoalClicked() {
		this.refs.newGoalModal.openModal();
	}
	handleSubGoalsClicked() {
		this.refs.subgoalsModal.openModal();
	}
	handleCommentsClicked() {
		this.refs.commentsModal.openModal();
	}

	render() {
		if (this.props.compactViewMode) {
			return (
				// style is to undo what materialize does in the card parent containing this modal
				<a id={this.props.goal._id}
				   onClick={this.props.onGoalClicked}
				   className='collection-item GoalSublistModal GoalListItem'
				   style={{paddingBottom: "20px", marginBottom: 0, marginRight: 0, textTransform: "none"}}>
					{ this.renderGoalBody() }
				</a>
			);
		} else {
			return (
				<div>
					<div className='card hoverable' style={{marginBottom: "40px"}}>
						{ this.renderGoalBody() }
						<GoalControls isEditing={this.state.isEditing}
									  goal={this.props.goal}
									  onNewClicked={this.handleNewGoalClicked}
									  onSubgoalsClicked={this.handleSubGoalsClicked}
									  onEditClicked={this.handleEditClicked}
									  onSaveClicked={this.handleSaveClicked}
									  onDeleteClicked={this.handleDeleteClicked}
									  onCancelClicked={this.handleCancelClicked}
									  onCommentsClicked={this.handleCommentsClicked}
									  commentCount={this.props.goal && this.props.goal.comments && this.props.goal.comments.length > 0 ? this.props.goal.comments.length : null }
						/>
					</div>
					<GoalNewModal ref="newGoalModal" parentGoalId={this.props.goal._id}/>
					<SubGoalsModal ref="subgoalsModal" parentGoalId={this.props.goal._id}/>
					<CommentsModal ref="commentsModal"
								   comments={this.props.goal.comments ? this.props.goal.comments : []}
								   objectId={this.props.goal._id}
								   objectType={Teal.ObjectTypes.Goal}/>
					<ReactTooltip/>
				</div>
			);
		}
	}
}

Goal.propTypes = {
	goal: React.PropTypes.object.isRequired,
		compactViewMode: React.PropTypes.bool,
		onClicked: React.PropTypes.func
};
