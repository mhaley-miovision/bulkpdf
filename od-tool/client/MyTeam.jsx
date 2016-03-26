MyTeam = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return {orgName:""};
		return {orgId:""};
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.contributors");
		var handle2 = Meteor.subscribe("users");

		if (handle.ready() && handle2.ready()) {
			var c = ContributorsCollection.findOne({email: Meteor.user().email});
			var o = null;
			if (c) {
				o = OrganizationsCollection.findOne({_id: c.physicalOrgId});
			}
			return {isLoading:false, contributor:c, contributorOrg: o ? o.name : '', contributorOrgId : c ? c.physicalOrgId : '' };
		} else {
			return {isLoading:true};
		}
	},

	handleSearch(orgName, type, id) {
		this.setState({orgName:orgName, orgId:id});
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (this.data.contributor && (this.state.orgName || this.data.contributorOrg)) {
			var org = this.state.orgName ? this.state.orgName : this.data.contributorOrg;
			var orgId = this.state.orgId ? this.state.orgId : this.data.contributorOrgId;
			return (
				<div className="section">
					<ObjectSearch onClick={this.handleSearch}
								  findOrganizations={true} findContributors={false}
								  notFoundLabel="Please type the name of an existing organization."/>
					<GoalsForOrganization orgId	={orgId}/>
					<div>
						<Organization objectId={org} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
					<TeamSkillsSummary orgId={org}/>
				</div>
			);
		} else {
			return (
				<NotOnAnyTeam/>
			);
		}
	}});