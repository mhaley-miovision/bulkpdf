RoleControls = React.createClass({
	propTypes: {
		role : React.PropTypes.object.isRequired,
		/*
		isEditing: React.PropTypes.bool.isRequired,
		onEditClicked: React.PropTypes.func.isRequired,
		onSaveClicked: React.PropTypes.func.isRequired,
		onCancelClicked: React.PropTypes.func.isRequired,
		onDeleteClicked: React.PropTypes.func.isRequired,
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
		return "ct_" + this.props.role._id;
	},

	notImplemented() {
		Materialize.toast("Not implemented yet",1000);
	},

	handleEditRole() {
		this.refs.editRoleModal.show(this.props.role);
	},
	handleDeleteRole() {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.RemoveRole, Teal.ObjectTypes.Role,
			"teal.roles.removeRole", [ this.props.role._id ], this.props.role);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	},

	render() {
		return (
			<div>
				<RoleEditModal id="editRoleModal" ref="editRoleModal" role={this.props.role}/>

				<div className="center">
					<ControlIconButton onClicked={this.handleDeleteRole} icon="delete" tip="Delete role" tipId={this.tipId()}/>
					<ControlIconButton onClicked={this.handleEditRole} icon="edit" tip="Edit role" tipId={this.tipId()}/>
					<ReactTooltip id={this.tipId()} place="bottom"/>
				</div>
			</div>
		);
	}
});