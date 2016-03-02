const TOAST_DURATION = 1000;

// Role component - represents a single role
Goal = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
		compactViewMode: React.PropTypes.bool,
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

	renderGoalBody() {
		if (this.state.isEditing) {
			return <GoalEdit ref="obj"
							 goal={this.props.goal}/>
		} else {
			if (this.props.goal.path.length == 0) {
				// this is a root level goal
				return this.renderRootLevelGoal();
			} else {
				let lw = this.props.goal.isLeaf ? 10 : 9;
				let rw = this.props.goal.isLeaf ? 2 : 3;
				return (
					//TODO: look into refactoring this into multiple components rather than all these switches
					<div className={this.props.compactViewMode ? '' : 'card-content'} onClick={this.props.onClicked}>
						<div className="row">
							<div className={"col m" + lw + " s12 GoalContainer"}>
								{ this.props.goal.isLeaf ?
									<span className="ProjectGoalTitle">{this.props.goal.name}</span>
									:
									<div className="">
										<span className="ProjectGoalTitle">{this.props.goal.name}</span>
										<span className="ProjectTag">{this.props.goal.rootGoalName}</span>
									</div>
								}
								<GoalDoneCriteria goal={this.props.goal}/>
								<GoalKeyObjectives goal={this.props.goal}/>
							</div>
							<div className={"col m" + rw + " s12 GoalContainer"}>
								{ this.props.goal.isLeaf ?
									<div className="TaskGoalSummaryContainer center">
										<div className="TaskGoalPhotos center">
											{ this.props.goal.ownerRoles.length > 0 ?
												<GoalUserPhotoList compactViewMode={this.props.compactViewMode}
																   list={this.props.goal.ownerRoles}
																   heading="Owner"/>
												: ''
											}
											{this.props.goal.contributorRoles.length > 0 ?
												<GoalUserPhotoList compactViewMode={this.props.compactViewMode}
																   list={this.props.goal.contributorRoles}
																   heading="Contributor"/>
												: ''
											}
										</div>
										<GoalState goal={this.props.goal}/>
										<br/>
										<GoalDueDateLabel goal={this.props.goal}/>
									</div>
									:
									<ProjectGoalSummary goal={this.props.goal}
														compactViewMode={this.props.compactViewMode}/>
								}
							</div>
						</div>
					</div>
				);
			}
		}
	},

	handleEditClicked() {
		this.setState({isEditing:true});
		if (this.refs.obj) {

		}
	},

	handleSaveClicked() {
		this.setState({isEditing:false});
		if (this.refs.obj) {
			let inputs = this.refs.obj.getInputs();
			Meteor.call("teal.goals.updateOrInsertGoal",
				inputs._id, null, inputs.name, inputs.keyObjectives, inputs.doneCriteria,
				inputs.ownerRoles, inputs.contributorRoles, inputs.state, inputs.dueDate);
			// TODO: goal state
			Materialize.toast("Goal saved!", 1000);
		}
	},

	handleCancelClicked() {
		// reset changes made
		this.refs.obj.setState(this.refs.obj.getInitialState());
		this.setState({isEditing:false});
	},

	handleDeleteClicked() {
		Meteor.call("teal.goals.deleteGoal", this.props.goal._id, function(err) {
			if (err) {
				Materialize.toast("Failed to delete goal: " + err, 1000);
			} else {
				Materialize.toast("Goal deleted!", 1000);
			}
		});
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
				   className='collection-item GoalSublistModal'
				   style={{marginBottom: 0, marginRight: 0, textTransform: "none"}}>
					{ this.renderGoalBody() }
				</a>
			);
		} else {
			return (
				<div>
					<div className='card hoverable' style={{marginBottom: "40px"}}>
						{ this.renderGoalBody() }
						<GoalControls newModalId= {this.getNewGoalModalId()}
									  subGoalsModalId={this.getSubGoalsModalId()}
									  isEditing={this.state.isEditing}
									  goal={this.props.goal}
									  onEditClicked={this.handleEditClicked}
									  onSaveClicked={this.handleSaveClicked}
									  onDeleteClicked={this.handleDeleteClicked}
									  onCancelClicked={this.handleCancelClicked}/>
					</div>
					<GoalNewModal id={this.getNewGoalModalId()} parentGoalId={this.props.goal._id}/>
					<SubGoalsModal id={this.getSubGoalsModalId()} parentGoalId={this.props.goal._id}/>
				</div>
			);
		}
	}
});

