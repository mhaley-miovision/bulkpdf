RoleListEdit = React.createClass({
	propTypes: {
		roleList : React.PropTypes.array.isRequired,
		heading : React.PropTypes.string,
		compactViewMode : React.PropTypes.bool,
		isEditing: React.PropTypes.bool
	},

	getInitialState() {
		return { roles: this.props.roleList };
	},

	handleOnDelete(event) {
		if (event.target.id) {
			//TODO:
			console.log("will remove r.id(" + event.target.id+")");
		}
	},

	renderRoles() {
		return this.props.roleList.map(role => {
			return <RoleItem key={role._id} role={role}
							 isEditing={this.props.isEditing} onDeleteClicked={this.handleOnDelete}/>
		});
	},

	addNewRole() {

	},

	render() {
		return (
			<div className="GoalOwnersSection">
				{ this.props.heading ?
					<div
						className="GoalSummaryHeading">{this.props.heading + (this.props.roleList.length > 1 ? "s" : "")}</div>
					: ''
				}
				<div className="GoalOwnerPhotos">
					{this.renderRoles()}
				</div>

				<div><ObjectSearch label="Enter email..." notFound="No matching roles found" findRoles={true} findContributors={false} findOrganizations={false}/></div>
			</div>
		);
	}
});