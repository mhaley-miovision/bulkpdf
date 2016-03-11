RoleEditModal = React.createClass({

	propTypes: {
		organization: React.PropTypes.string,
		organizationId: React.PropTypes.string,
		role: React.PropTypes.object,
	},

	handleSave() {
		let inputs = this.refs.roleEdit.getInputs();
		Meteor.call("teal.roles.updateOrInsertRole",
			inputs._id,
			inputs.organizationId,
			inputs.label,
			inputs.accountabilityLevel,
			inputs.contributorId,
			inputs.startDate,
			inputs.endDate,
			inputs.isExternal,
			inputs.isLeadNode,
			inputs.isPrimaryAccountabilty,
			inputs.accountabilities,
			function(err) {
				if (err) {
					Materialize.toast("Error creating role: " + err, 1000);
				} else {
					Materialize.toast("Role successfully saved!", 1000);
				}
			}
		);

		this.refs.roleEdit.clearInputs();
		$('#' + this.props.id).closeModal();
	},

	handleClose() {
		this.refs.roleEdit.clearInputs();
		$('#' + this.props.id).closeModal();
	},

	show() {
		this.refs.roleEdit.clearInputs();
		$('#' + this.props.id).openModal();
	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<RoleEdit role={this.props.role}
							  organization={this.props.organization}
							  organizationId={this.props.organizationId}
							  ref="roleEdit"/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<i className="material-icons GreyButton" onClick={this.handleClose}
						   style={{float:"none",marginTop:"7px"}}>close</i>
						<i className="material-icons GreyButton" onClick={this.handleSave}
						   style={{float:"none",marginTop:"7px"}}>check</i>
					</div>
				</div>
			</div>
		);
	}
});