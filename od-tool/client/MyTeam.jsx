MyTeam = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return {orgName:""};
		return {orgId:""};
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.contributors");
		var handle2 = Meteor.subscribe("users");

		console.log("getMeteorData! - ")

		if (handle.ready() && handle2.ready()) {
			var c = ContributorsCollection.findOne({email:Meteor.user().email});
			return {isLoading:false, contributorOrg: c ? c.physicalTeam : "", contributorOrgId : c ? c.physicalOrgId : "" };
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
		} else if (this.state.orgName || this.data.contributorOrg) {
			var org = this.state.orgName ? this.state.orgName : this.data.contributorOrg;
			var orgId = this.state.orgId ? this.state.orgId : this.data.contributorOrgId;
			return (
				<div className="section">
					<ObjectSearch onClick={this.handleSearch} findOrganizations={true} findContributors={false}/>
					<GoalsForOrganization objectId={orgId}/>
					<div>
						<Organization objectId={org} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
					<TeamSkillsSummary orgName={org}/>
				</div>
			);
		} else {
			return (
				<NotOnAnyTeam/>
			);
		}
	}});