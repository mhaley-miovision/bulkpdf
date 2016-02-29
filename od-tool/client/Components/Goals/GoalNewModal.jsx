GoalNewModal = React.createClass({
	propTypes: {
		parentGoalId: React.PropTypes.string.isRequired,
		id: React.PropTypes.string.isRequired,
	},

	handleSave() {
		let g = this.refs.newGoal.getInputs();
		debugger;
		Meteor.call("teal.goals.updateOrInsertGoal",
			null, this.props.parentGoalId, g.name, g.keyObjectives, g.doneCriteria, g.ownerRoles,
				g.contributorRoles, g.state, g.estimatedCompletionOn);
		Materialize.toast("Goal created!", 1000);
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
						<i className="material-icons GreyButton" onClick={this.handleClose}
						   style={{float:"none"}}>close</i>
						<i className="material-icons GreyButton" onClick={this.handleSave}
						   style={{float:"none"}}>check</i>
					</div>
				</div>
			</div>
		);
	}
});