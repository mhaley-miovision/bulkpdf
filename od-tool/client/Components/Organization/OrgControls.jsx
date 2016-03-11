OrgControls = React.createClass({
	propTypes: {
		org : React.PropTypes.object.isRequired,
		/*
		isEditing: React.PropTypes.bool.isRequired,
		onEditClicked: React.PropTypes.any.isRequired,
		onSaveClicked: React.PropTypes.any.isRequired,
		onCancelClicked: React.PropTypes.any.isRequired,
		onDeleteClicked: React.PropTypes.any.isRequired,
		newModalId: React.PropTypes.string.isRequired,
		subGoalsModalId: React.PropTypes.string.isRequired,
		*/
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
		return "ct_" + this.props.org._id;
	},

	notImplemented() {
		Materialize.toast("Not implemented yet",1000);
	},

	handleNewRole() {
		this.refs.orgNewRoleModal.show();
	},
	handleRemoveOrg() {
		Meteor.call("teal.orgs.removeOrganization", this.props.org._id);
	},
	handleAddOrg() {
		this.refs.orgNewOrgModal.show();
	},
	handleEditOrg() {
		this.refs.orgEditOrgModal.show();
	},

	render() {
		return (
			<div>
				<RoleEditModal id="orgNewRoleModal" ref="orgNewRoleModal"
							   organization={this.props.org.name} organizationId={this.props.org._id}/>
				<OrgEditModal id="orgNewOrgModal" ref="orgNewOrgModal"
							  parentOrg={this.props.org.name} parentOrgId={this.props.org._id}/>
				<OrgEditModal id="orgEditOrgModal" ref="orgEditOrgModal" org={this.props.org}/>

				<div className="center">
					<i data-for={this.tipId()} data-tip="Remove organization"
					   className="material-icons GreyButton"
					   onClick={this.handleRemoveOrg}>delete</i>
					<i data-for={this.tipId()} data-tip="Add role"
					   className="material-icons GreyButton"
					   onClick={this.handleNewRole}>add</i>
					<i data-for={this.tipId()} data-tip="Add organization"
					   className="material-icons GreyButton"
					   onClick={this.handleAddOrg}>add_circle_outline</i>
					<i data-for={this.tipId()} data-tip="Edit organization"
					   className="material-icons GreyButton"
					   onClick={this.handleEditOrg}>edit</i>

					<ReactTooltip id={this.tipId()} place="bottom"/>
				</div>`
			</div>
		);
	}
});