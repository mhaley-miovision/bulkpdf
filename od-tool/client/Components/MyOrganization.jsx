MyOrganization = React.createClass({

	getInitialState() {
		return { org: "Miovision" };
	},

	handleOrgChanged(o) {
		this.setState({ org: o.name });
	},

	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="col s12">
						<span className="flow-text">
							<OrganizationSelector onClick={this.handleOrgChanged} />
						</span>
					</div>
				</div>
				<div className="row">
					<div className="col s12">
						<Organization ref="org" org={this.state.org}/>
					</div>
				</div>
			</div>
		);
	}
});

