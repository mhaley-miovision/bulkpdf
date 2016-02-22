MyTeam = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return {orgName:""};
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.contributors");
		var handle2 = Meteor.subscribe("users");

		if (handle.ready() && handle2.ready()) {
			var c = ContributorsCollection.findOne({email:Meteor.user().email});
			if (c) {
				this.state.orgName = c.physicalTeam;
			}
			return {isLoading:false};
		} else {
			return {isLoading:true};
		}
	},

	componentDidMount() {
		this.forceUpdate();
	},

	handleSearch(orgName) {
		this.setState({orgName:orgName});
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (this.state.orgName) {
			return (
				<div className="section center">
					<ObjectSearch onClick={this.handleSearch} findOrganizations={true} findContributors={false}/>

					<TeamSkillsSummary orgName={this.state.orgName}/>
					<div>
						<Organization objectId={this.state.orgName} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
				</div>
			);
		} else {
			return (
				<NotOnAnyTeam/>
			);
		}
	}});