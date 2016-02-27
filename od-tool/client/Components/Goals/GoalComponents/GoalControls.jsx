GoalControls = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool.isRequired,
		onEditClicked: React.PropTypes.any.isRequired,
		onSaveClicked: React.PropTypes.any.isRequired,
		onCancelClicked: React.PropTypes.any.isRequired,
	},

	getInitialState() {
		return {
			subGoalsModalVisible: false,
			subGoalsTargetId: null,
		};
	},

	componentDidMount() {

	},

	getModalId() {
		return this.props.goal._id+"_modal";
	},

	handleCloseModal() {
		this.setState({subGoalsTargetId:null});
		$('#' + this.getModalId()).closeModal();
	},

	showModal() {
		this.setState({subGoalsTargetId:this.props.goal._id});
		$('#' + this.getModalId()).openModal();
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
						<i className="material-icons GreyButton" onClick={this.props.onEditClicked}>edit</i>
						{	this.props.goal.isLeaf ? '' :

						<i className="material-icons GreyButton" onClick={this.showModal}>list</i>
						}
					</div>
					<div id={this.getModalId()} className="modal">
						<div className="modal-content" style={{padding:0}}>
							<GoalSubGoals ref="subgoalModalObj"
										  objectId={this.state.subGoalsTargetId}
										  compactViewMode={true}/>
						</div>
						<div className="modal-footer">
							<div className="center">
								<i className="material-icons GreyButton" onClick={this.handleCloseModal}
								   style={{float:"none"}}>check</i>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}
});