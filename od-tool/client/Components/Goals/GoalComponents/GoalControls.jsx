GoalControls = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool.isRequired,
		onEditClicked: React.PropTypes.any.isRequired,
		onSaveClicked: React.PropTypes.any.isRequired,
		onCancelClicked: React.PropTypes.any.isRequired,
		onDeleteClicked: React.PropTypes.any.isRequired,
		newModalId: React.PropTypes.string.isRequired,
		subGoalsModalId: React.PropTypes.string.isRequired,
	},

	getInitialState() {
		return {
			subGoalsModalVisible: false,
			subGoalsTargetId: null,
		};
	},

	showNewGoalModal() {
		// TODO: move this to a method on the component
		$('#' + this.props.newModalId).openModal();
	},
	showSubgGoalsModal() {
		// TODO: move this to a method on the component
		$('#' + this.props.subGoalsModalId).openModal();
	},
	tipId() {
		return "ct_" + this.props.goal._i;
	},

	render() {
		if (this.props.isEditing) {
			return (
				<div className="card-action center-align">
					<i data-for={this.tipId()} data-tip="Cancel" className="material-icons GreyButton" onClick={this.props.onCancelClicked}>close</i>
					<i data-for={this.tipId()} data-tip="Save" className="material-icons GreyButton" onClick={this.props.onSaveClicked}>check</i>
					<ReactTooltip id={this.tipId()} place="bottom"/>
				</div>
			);
		} else {
			return (
				<div className="card-action">
					<div className="center-align">
						{  this.props.goal.isLeaf ?
							<i data-for={this.tipId()} data-tip="Delete goal" className="material-icons GreyButton" onClick={this.props.onDeleteClicked}>delete</i>
							: ''
						}
						<i data-for={this.tipId()} data-tip="Edit goal" className="material-icons GreyButton" onClick={this.props.onEditClicked}>edit</i>
						{	this.props.goal.isLeaf ? '' :

							<i data-for={this.tipId()} data-tip="List subgoals" className="material-icons GreyButton" onClick={this.showSubgGoalsModal}>list</i>
						}
						<i data-for={this.tipId()} data-tip="Add subgoal" className="material-icons GreyButton" onClick={this.showNewGoalModal}>add</i>
						<ReactTooltip id={this.tipId()} place="bottom"/>
					</div>
				</div>
			);
		}
	}
});