MyTeam = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return {orgName:""};
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.contributors");
		var handle2 = Meteor.subscribe("users");

		console.log("getMeteorData! - ")

		if (handle.ready() && handle2.ready()) {
			var c = ContributorsCollection.findOne({email:Meteor.user().email});
			return {isLoading:false, contributorOrg: c ? c.physicalTeam : ""};
		} else {
			return {isLoading:true};
		}
	},

		/*
	componentDidMount() {
		this.forceUpdate();
	},*/

	handleSearch(orgName) {
		this.setState({orgName:orgName});
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (this.state.orgName || this.data.contributorOrg) {
			var org = this.state.orgName ? this.state.orgName : this.data.contributorOrg;
			return (
				<div className="section center">
					<ObjectSearch onClick={this.handleSearch} findOrganizations={true} findContributors={false}/>

					<TeamSkillsSummary orgName={org}/>
					<div>
						<Organization objectId={org} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
				</div>
			);
		} else {
			return (
				<NotOnAnyTeam/>
			);
		}
	}});