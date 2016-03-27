GoalListModal = React.createClass({
	propTypes: {
		goalList: React.PropTypes.array.isRequired,
		id: React.PropTypes.string.isRequired,
	},

	handleClose() {
		$('#' + this.props.id).closeModal();
	},

	handleGoalClicked(evt) {
		this.handleClose();
		let id = evt.currentTarget.id;
		let url = FlowRouter.path("goalById", {goalId:id}, {showBackButton:true});
		FlowRouter.go(url);
	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<GoalList goalList={this.props.goalList}
							  compactViewMode={true}
							  onGoalClicked={this.handleGoalClicked}/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<ControlIconButton onClicked={this.handleClose} icon="check"/>
					</div>
				</div>
			</div>
		);
	}
});