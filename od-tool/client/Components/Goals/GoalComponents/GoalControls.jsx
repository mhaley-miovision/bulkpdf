GoalControls = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool.isRequired,
		onNewClicked: React.PropTypes.func.isRequired,
		onSubgoalsClicked: React.PropTypes.func.isRequired,
		onEditClicked: React.PropTypes.func.isRequired,
		onSaveClicked: React.PropTypes.func.isRequired,
		onCancelClicked: React.PropTypes.func.isRequired,
		onDeleteClicked: React.PropTypes.func.isRequired,
		onCommentsClicked: React.PropTypes.func.isRequired,
	},

	tipId() {
		return "ct_" + this.props.goal._id;
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

							<i data-for={this.tipId()} data-tip="List subgoals" className="material-icons GreyButton" onClick={this.props.onSubgoalsClicked}>list</i>
						}
						<i data-for={this.tipId()} data-tip="Comments" className="material-icons GreyButton" onClick={this.props.onCommentsClicked}>comment</i>
						<i data-for={this.tipId()} data-tip="Add subgoal" className="material-icons GreyButton" onClick={this.props.onNewClicked}>add</i>
						<ReactTooltip id={this.tipId()} place="bottom"/>
					</div>
				</div>
			);
		}
	}
});