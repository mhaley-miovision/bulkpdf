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
					<a className="btn-flat" onClick={this.props.onCancelClicked}>Cancel</a>
					<a className="btn" onClick={this.props.onSaveClicked}>Save</a>
				</div>
			);
		} else {
			return (
				<div className="card-action">
					<div className="center-align">
						<a className="btn-flat" onClick={this.props.onEditClicked}>Edit</a>
						{	this.props.goal.isLeaf ? '' :
							<a className="btn-flat" onClick={this.showModal}>Subgoals</a>
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
								<a href="#!" className=" modal-action modal-close waves-effect waves-green btn"
								   style={{float:"none"}}
								   onClick={this.handleCloseModal}>Close</a>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}
});