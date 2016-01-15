MyOrganization = React.createClass({

	getInitialState() {
		return {
			org: "Miovision",
			roleMode: true,
		};
	},

	handleOrgChanged(o) {
		this.refs.org.zoomToOrg(o);
	},


	handleRoleModeChanged(event) {
		console.log(this.refs.roleMode.checked);
		this.setState( {roleMode: !this.refs.roleMode.checked });
	},

	componentDidMount: function() {
	},

	render() {
		return (
			<div className="container">
				<div className="section center">
					<a className="waves-effect waves-light btn disabled">Accountabilities</a>
					<a className="waves-effect waves-light btn">Team Composition</a>
				</div>
				<div className="section center">
					<div className="switch">
						<label>
							Role
							<input type="checkbox"
								   checked={!this.state.roleMode} ref="roleMode"
								   onChange={this.handleRoleModeChanged}/><span className="lever"></span>
							Individual
						</label>
					</div>
				</div>
				<div>
					<OrganizationSelector onClick={this.handleOrgChanged} />
				</div>
				<div>
					<Organization ref="org" org={this.state.org} roleMode={this.state.roleMode}/>
				</div>
			</div>
		);
	}
});

