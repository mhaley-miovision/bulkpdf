const TOAST_DURATION = 1000;

// Role component - represents a single role
Goal = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
		compactViewMode: React.PropTypes.bool
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

	renderTaskState() {
		let label = "Not Started";
		if (this.props.goal.state == 2) {
			label = "Completed";
		} else if (this.props.goal.state == 1) {
			label = "In Progress";
		}
		let classes = "TaskGoalState" + label.replace(" ", "");
		return <div className={classes}>{label}</div>;
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
					<div className={this.props.compactViewMode ? '' : 'card-content'}>
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
												<GoalUserPhotoList compactViewMode={this.props.compactViewMode} list={this.props.goal.ownerRoles}/>
												: ''
											}
											{this.props.goal.contributorRoles.length > 0 ?
												<GoalUserPhotoList compactViewMode={this.props.compactViewMode} list={this.props.goal.contributorRoles}/>
												: ''
											}
										</div>
										<div className="TaskGoalState">
											{this.renderTaskState()}
										</div>
										<br/>
										<GoalDueDateLabel goal={this.props.goal}/>
									</div>
									:
									<ProjectGoalSummary goal={this.props.goal}/>
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
				inputs._id, inputs.name, inputs.keyObjectives, inputs.doneCriteria,
				inputs.ownersList, inputs.contributorsList);
			Materialize.toast("Goal saved!", 1000);
		}
	},

	handleCancelClicked() {
		// reset changes made
		this.refs.obj.setState(this.refs.obj.getInitialState());
		this.setState({isEditing:false});
	},

	render() {
		return (
			<div className={this.props.compactViewMode ? 'collection-item' : 'card hoverable'}
				 style={{marginBottom: this.props.compactViewMode ? "0" : "40px"}}>
				{ this.renderGoalBody() }
				{ this.props.compactViewMode ? '' :
					<GoalControls isEditing={this.state.isEditing}
								  goal={this.props.goal}
								  onEditClicked={this.handleEditClicked}
								  onSaveClicked={this.handleSaveClicked}
								  onCancelClicked={this.handleCancelClicked}/>
				}
			</div>
		);
	}
});

