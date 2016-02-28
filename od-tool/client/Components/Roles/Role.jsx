RoleItem = React.createClass({

	propTypes: {
		role: React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool,
		onDeleteClicked: React.PropTypes.any.isRequired,
	},

	render() {
		var r = this.props.role;
		return (
			<div className="TealChip" style={{cursor:"pointer"}}
				 data-tip={this.props.role.accountabilityLabel}>
				<a href={ FlowRouter.path("profile", {}, {objectId: r.email}) } >
					<img src={ r.photo ? r.photo : "img/user_avatar_blank.jpg"}/>
				</a>
				{ r.contributor ? r.contributor : "&lt;unfilled&gt;" }
				<i className="material-icons " onClick={this.props.onDeleteClicked} id={"r_"+r._id}>close</i>
				<ReactTooltip place="bottom"/>
			</div>
		);
	},
});