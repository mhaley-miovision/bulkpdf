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
		commentCount: React.PropTypes.number,
	},

	tipId() {
		return "ct_" + this.props.goal._id;
	},

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
});