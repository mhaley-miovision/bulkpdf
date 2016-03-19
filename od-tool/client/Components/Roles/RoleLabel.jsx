// Role component - represents a single role
RoleLabel = React.createClass({
	propTypes: {
		// This component gets the task to display through a React prop.
		// We can use propTypes to indicate it is required
		roleLabel: React.PropTypes.object.isRequired,
	},

	getInitialState() {
		return {
			isEditing: false,
			newLabel: this.props.roleLabel.name,
		};
	},

	deleteThisRoleLabel() {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.RemoveRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.removeRoleLabel", [ this.props.role._id ], this.props.role);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	},

	renameThisRoleLabel() {
		let changeObject = TealChanges.createChangeObject(TealChanges.Types.RenameRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.renameRoleLabel", [ this.props.roleLabel._id, this.state.newLabel ], this.props.roleLabel);
		Meteor.call("teal.changes.create", changeObject, TealChanges.notifyChangeResult);
	},

	handleSubmit(event) {
		event.preventDefault();
		this.setState({isEditing:false});
		if (this.state.newLabel != '') {
			this.renameThisRoleLabel();
		}
	},

	handleOnBlur() {
		this.setState({isEditing:false});
	},

	handleOnChange() {
		this.state.newLabel = this.refs.newLabel.value;
	},

	handleOnEdit() {
		this.setState({isEditing:true});
	},

	render() {
		if (this.state.isEditing) {
			return (
				<li className="collection-item">
					<form onSubmit={this.handleSubmit}>
						<input placeholder="Enter a new label"
							   type="text"
							   className="validate"
							   autoFocus
							   onBlur={this.handleOnBlur}
							   ref="newLabel"
							   onChange={this.handleOnChange}
						/>
					</form>
				</li>
			);
		} else {
			return (
				<li className="collection-item">
					{this.props.roleLabel.name}
					<i className="waves-effect waves-teal itemEditingIcons tiny material-icons right grey-text" onClick={this.handleOnEdit}>edit</i>
					<i className="waves-effect waves-teal itemEditingIcons tiny material-icons right grey-text" onClick={this.deleteThisRoleLabel}>delete</i>
				</li>
			);
		}
	}
});

