RolesSummary = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.roles");

		if (handle.ready()) {
			let roles = RolesCollection.find({email:this.props.objectId}).fetch();
			return { doneLoading: true, roles: roles }
		} else {
			return { doneLoading: false };
		}
	},

	notImplemented() {
		Materialize.toast( "Not implemented yet, stay tuned!", 1000);
	},

	roleEditShow(evt) {
		console.log(this.refs);
		console.log('m'+evt.currentTarget.id);
		this.refs['m'+evt.currentTarget.id].show();
	},

	renderRolesControls(r) {
		let controls = [];

		// TODO: implement actually jumping to the role, not the contributor
		// TODO: replace miovision with root org name
		var url1 = FlowRouter.path("organizationView", {}, {
			objectId: "Miovision",
			objectType:"organization",
			zoomTo:r.organization});

		// public controls
		controls.push(
			<a key={r._id+"1"} href={url1} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">search</i>
			</a>
		);

		// private controls
		// TODO: check for permissions here

		// edit
		controls.push(
			<a key={r._id+"4"} id={r._id} onClick={this.roleEditShow} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">edit</i>
			</a>
		);

		/*
		controls.push(
			<a key={r._id+"2"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_down</i>
			</a>
		);
		controls.push(
			<a key={r._id+"3"} onClick={this.notImplemented} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">thumb_up</i>
			</a>
		);
		*/

		return controls;
	},

	renderRoles() {
		if (this.data.doneLoading) {
			return this.data.roles.map(r => {
				return (
					<li className="collection-item" key={r._id}>
						<div className="collection-item-text">
							{r.label}, {r.organization}
						</div>
						{this.renderRolesControls(r)}
					</li>
				);
			});
		}
	},

	renderModals() {
		if (this.data.doneLoading) {
			return this.data.roles.map(r => {
				return <RoleEditModal key={r._id} role={r} ref={'m'+r._id} id={'m'+r._id}/>
			});
		}
		return false;
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader" key={_.escape(this.props.email)+"_roles"}>
							Roles
						</li>
						{this.renderRoles()}
					</ul>
					{this.renderModals()}
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
});