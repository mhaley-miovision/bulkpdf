MyOrganization = React.createClass({

	getInitialState() {
		return { org: "Miovision" };
	},

	handleOrgChanged(o) {
		this.refs.org.zoomToOrg(o);
	},
	componentDidMount: function() {
	},

	render() {
		return (
			<div className="container">
				<div>
					<OrganizationSelector onClick={this.handleOrgChanged} />
				</div>
				<div>
					<Organization ref="org" org={this.state.org}/>
				</div>
			</div>
		);
	}
});

