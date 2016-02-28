RoleItem = React.createClass({

	propTypes: {
		role: React.PropTypes.object.isRequired,
		isEditing: React.PropTypes.bool,
		onDeleteClicked: React.PropTypes.any.isRequired,
	},

	render() {;
		var r = this.props.role;
		return (
			<div className="chip" data-tip={this.props.role.accountabilityLabel } style={{cursor:"pointer"}}>
				<a href={ FlowRouter.path("profile", {}, {objectId: r.email}) }>
					<img src={ r.photo ? r.photo : "img/user_avatar_blank.jpg"} alt="Contact Person"/>
				</a>
				{ r.contributor ? r.contributor : "&lt;unfilled&gt;" }
				<i className="material-icons " onClick={this.props.onDeleteClicked} id={"r_"+r._id}>close</i>
				<ReactTooltip place="bottom" class="TealToolTip" />
			</div>
		);
	},
});