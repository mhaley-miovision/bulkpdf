const TOAST_DURATION = 1000;

// Role component - represents a single role
Goal = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
		compactViewMode: React.PropTypes.bool,
		onClicked: React.PropTypes.func,
	},

	getInitialState() {
		return { isEditing: false };
	},

	renderRootLevelGoal() {
		return (
			<div className="row">
				<div className="col m9 s12 GoalContainer">
					<div className="RootGoalTitle">{this.props.goal.name}</div>
				</div>
			</div>
		);
	},

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
	},

	renderGoalBodyContents(containerClasses) {
		return (
			<div className={containerClasses}>
				<GoalDoneCriteria goal={this.props.goal}/>
				<GoalKeyObjectives goal={this.props.goal}/>
			</div>
		);
	},

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
	},

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
	},

	handleEditClicked() {
		this.setState({isEditing:true});
	},

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
	},

	handleCancelClicked() {
		// reset changes made
		this.refs.obj.setState(this.refs.obj.getInitialState());
		this.setState({isEditing:false});
	},

	handleDeleteClicked() {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.RemoveGoal, Teal.ObjectTypes.Goal,
			"teal.goals.deleteGoal", [ this.props.goal._id ], this.props.goal);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	},

	handleNewGoalClicked() {
		$('#' + this.getNewGoalModalId()).openModal();
	},
	handleSubGoalsClicked() {
		$('#' + this.getSubGoalsModalId()).openModal();
	},
	handleCommentsClicked() {
		if (this.refs && this.refs.commentsModal) {
			this.refs.commentsModal.show();
		} else {
			console.error("commentsModal not mounted yet");
		}
	},

	getNewGoalModalId() {
		return this.props.goal._id+"_new";
	},
	getSubGoalsModalId() {
		return this.props.goal._id+"_sub";
	},

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
									  onCommentsClicked={this.handleCommentsClicked}/>
					</div>
					<GoalNewModal id={this.getNewGoalModalId()} parentGoalId={this.props.goal._id}/>
					<SubGoalsModal id={this.getSubGoalsModalId()} parentGoalId={this.props.goal._id}/>
					<CommentsModal ref="commentsModal"
								   comments={this.props.goal.comments ? this.props.goal.comments : []}
								   objectId={this.props.goal._id}
								   objectType={Teal.ObjectTypes.Goal}/>
				</div>
			);
		}
	}
});

