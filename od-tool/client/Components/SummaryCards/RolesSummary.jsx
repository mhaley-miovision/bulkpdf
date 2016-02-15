RolesSummaryCard = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("roles");

		if (handle.ready()) {
			let roles = RolesCollection.find({email:this.props.objectId}).fetch();
			return { doneLoading: true, roles: roles }
		} else {
			return { doneLoading: false };
		}
	},

	renderRolesControls(r) {
		let controls = [];

		// TODO: implement actually jumping to the role, not the contributor
		var url1 = FlowRouter.path("organizationView", {}, { objectId: r.organization, objectType:"organization"});

		// public controls
		controls.push(
			<a href={url1} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">search</i>
			</a>
		);

		// private controls
		// TODO: check for permissions here

		controls.push(
			<a href="#" className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_down</i>
			</a>
		);
		controls.push(
			<a href="#" className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_up</i>
			</a>
		);

		return controls;
	},

	renderRoles() {
		if (this.data.doneLoading) {
			return this.data.roles.map(r => {
				return (
					<li className="collection-item">
						<div className="collection-item-text">
							{r.role}, {r.organization}
						</div>
						{this.renderRolesControls(r)}
					</li>
				);
			});
		}
	},

	render() {
		var url1 = FlowRouter.path("organizationView", {}, { objectId: "Computer Vision", objectType:"organization"});
		var url2 = FlowRouter.path("organizationView", {}, { objectId: "Organizational Development", objectType:"organization"});

		if (this.data.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Roles</li>
						{this.renderRoles()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
});