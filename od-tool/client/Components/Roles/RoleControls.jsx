RoleControls = React.createClass({
	propTypes: {
		role : React.PropTypes.object.isRequired,
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
		return "ct_" + this.props.role._id;
	},

	notImplemented() {
		Materialize.toast("Not implemented yet",1000);
	},

	handleEditRole() {
		this.refs.editRoleModal.show(this.props.role);
	},
	handleDeleteRole() {
		Meteor.call("teal.roles.removeRole", this.props.role._id);
	},

	render() {
		return (
			<div>
				<RoleEditModal id="editRoleModal" ref="editRoleModal" role={this.props.role}/>

				<div className="center">
					<i data-for={this.tipId()} data-tip="Delete role"
					   className="material-icons GreyButton"
					   onClick={this.handleDeleteRole}>delete</i>
					<i data-for={this.tipId()} data-tip="Edit role"
					   className="material-icons GreyButton"
					   onClick={this.handleEditRole}>edit</i>
					<ReactTooltip id={this.tipId()} place="bottom"/>
				</div>
			</div>
		);
	}
});