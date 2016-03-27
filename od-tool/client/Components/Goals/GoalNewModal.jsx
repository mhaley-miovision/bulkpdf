GoalNewModal = React.createClass({
	propTypes: {
		parentGoalId: React.PropTypes.string.isRequired,
		id: React.PropTypes.string.isRequired,
	},

	handleSave() {
		let g = this.refs.newGoal.getInputs();

		let changeObject = TealChanges.createChangeObject(TealChanges.Types.NewGoal, Teal.ObjectTypes.Goal,
			"teal.goals.updateOrInsertGoal", [ TealFactory.createGoal(
				null, this.props.parentGoalId, g.name, g.keyObjectives, g.doneCriteria, g.ownerRoles,
				g.contributorRoles, g.state, g.dueDate) ], null);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);

		this.refs.newGoal.clearInputs();
		$('#' + this.props.id).closeModal();
	},

	handleClose() {
		this.refs.newGoal.clearInputs();
		$('#' + this.props.id).closeModal();
	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<GoalEdit ref="newGoal"/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<ControlIconButton onClicked={this.handleClose} icon="close"/>
						<ControlIconButton onClicked={this.handleSave} icon="check"/>
					</div>
				</div>
			</div>
		);
	}
});