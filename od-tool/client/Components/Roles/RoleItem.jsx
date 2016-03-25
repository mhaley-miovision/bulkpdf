RoleItem = React.createClass({
	propTypes: {
		role: React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool,
		onDeleteClicked: React.PropTypes.func.isRequired,
	},

	render() {
		var r = this.props.role;
		return (
			<div className="TealChip" style={{cursor:"pointer"}}
				 data-tip={this.props.role.accountabilityLabel}>
				<a href={ FlowRouter.path("profile", {}, {objectId: r.email}) } >
					<img src={ Teal.userPhotoUrl(r.photo) }/>
				</a>
				{ r.contributor ? r.contributor : "<unfilled>" }
				<i className="material-icons " onClick={this.props.onDeleteClicked} id={"r_"+r._id}>close</i>
			</div>
		);
	},
});