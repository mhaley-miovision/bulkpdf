OrgEditModal = React.createClass({

	propTypes: {
		organization: React.PropTypes.string,
		parentOrg: React.PropTypes.string,
		parentOrgId: React.PropTypes.string,
	},

	handleSave() {
		let inputs = this.refs.orgEdit.getInputs();
		Meteor.call("teal.orgs.updateOrInsertOrg",
			inputs._id,
			inputs.name,
			inputs.parentOrgId,
			inputs.startDate,
			inputs.endDate,
			function(err) {
				if (err) {
					Materialize.toast("Error creating organization: " + err, 1000);
				} else {
					Materialize.toast("Organization successfully saved!", 1000);
				}
			}
		);

		this.refs.orgEdit.clearInputs();
		$('#' + this.props.id).closeModal();
	},

	handleClose() {
		this.refs.orgEdit.clearInputs();
		$('#' + this.props.id).closeModal();
	},

	show() {
		this.refs.orgEdit.clearInputs();
		$('#' + this.props.id).openModal();
	},

	render() {
		return (
			<div id={this.props.id} className="modal modal-fixed-footer">
				<div className="modal-content" style={{padding:0}}>
					<OrgEdit organization={this.props.organization}
							 parentOrg={this.props.parentOrg}
							 parentOrgId={this.props.parentOrgId}
							 ref="orgEdit"/>
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