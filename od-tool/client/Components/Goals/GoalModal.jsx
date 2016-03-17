GoalModal = React.createClass({
	propTypes: {
		id: React.PropTypes.string.isRequired,
		goal: React.PropTypes.object.isRequired,
		hideControls: React.PropTypes.bool,
	},

	handleClose() {
		$('#' + this.props.id).closeModal();
	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<Goal goal={this.props.goal} hideControls={this.props.hideControls}/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<i className="material-icons GreyButton" onClick={this.handleClose}
						   style={{float:"none",marginTop:"7px"}}>check</i>
					</div>
				</div>
			</div>
		);
	}
});