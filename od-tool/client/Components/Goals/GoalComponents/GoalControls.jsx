GoalControls = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool.isRequired,
		onEditClicked: React.PropTypes.any.isRequired,
		onSaveClicked: React.PropTypes.any.isRequired,
		onCancelClicked: React.PropTypes.any.isRequired,
		onDeleteClicked: React.PropTypes.any.isRequired,
	},

	getInitialState() {
		return {
			subGoalsModalVisible: false,
			subGoalsTargetId: null,
		};
	},

	getModalId() {
		return this.props.goal._id+"_modal";
	},

	getNewGoalModalId() {
		return this.props.goal._id+"_new";
	},

	handleCloseModal() {
		this.setState({subGoalsTargetId:null});
		$('#' + this.getModalId()).closeModal();
	},

	showModal() {
		this.setState({subGoalsTargetId:this.props.goal._id});
		$('#' + this.getModalId()).openModal();
	},

	showNewGoalModal() {
		// TODO: move this to a method on the component
		$('#' + this.getNewGoalModalId()).openModal();
	},

	render() {
		if (this.props.isEditing) {
			return (
				<div className="card-action center-align">
					<i className="material-icons GreyButton" onClick={this.props.onCancelClicked}>close</i>
					<i className="material-icons GreyButton" onClick={this.props.onSaveClicked}>check</i>
				</div>
			);
		} else {
			return (
				<div className="card-action">
					<div className="center-align">
						{  this.props.goal.isLeaf ? // only show delete button for leaves
							<i className = "material-icons GreyButton" onClick={this.props.onDeleteClicked}>delete</i>
							: ''
						}
						<i className="material-icons GreyButton" onClick={this.props.onEditClicked}>edit</i>
						{	this.props.goal.isLeaf ? '' :

							<i className="material-icons GreyButton" onClick={this.showModal}>list</i>
						}
						<i className="material-icons GreyButton" onClick={this.showNewGoalModal}>add</i>
					</div>
					<div id={this.getModalId()} className="modal modal-fixed-footer">
						<div className="modal-content" style={{padding:0}}>
							<GoalSubGoals ref="subgoalModalObj"
										  objectId={this.state.subGoalsTargetId}
										  compactViewMode={true}/>
						</div>
						<div className="modal-footer">
							<div className="center">
								<i className="material-icons GreyButton" onClick={this.handleCloseModal}
								   style={{float:"none",marginTop:"7px"}}>check</i>
							</div>
						</div>
					</div>
					<GoalNewModal id={this.getNewGoalModalId()} parentGoalId={this.props.goal._id}/>
				</div>
			);
		}
	}
});