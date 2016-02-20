MyTeam = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return { roleMode: true, orgName: "" };
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.contributors");

		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		if (!this.state.orgName) {
			var myUserName = Meteor.user().profile.name;
			var contributor = ContributorsCollection.findOne({name: myUserName});
			var organization = contributor ? contributor.physicalTeam : null;
			var data = {
				isLoading: !handle.ready(),
				org: organization
			};
			this.state.orgName = organization;
		} else {
			data = { isLoading: false, org: this.state.orgName };
		}
		return data;
	},

	componentDidMount() {
		this.forceUpdate();
	},

	handleSearch(orgName) {
		console.log("handleSearch: " + orgName)
		this.setState({orgName:orgName});
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (this.state.orgName) {
			return (
				<div className="section center">
					<ObjectSearch onClick={this.handleSearch} findOrganizations={true} findContributors={false}  />

					<TeamSkillsSummary orgName={this.state.orgName}/>
					<div>
						<Organization objectId={this.state.orgName} roleMode={this.state.roleMode} roleModeVisible={true} searchVisible={false}/>
					</div>
				</div>
			);
		} else {
			return (
				<div className="row centeredCard">
					<div className="col s12 m6 offset-m3">
						<div className="card blue-grey darken-1">
							<div className="card-content white-text">
								<span className="card-title">You are not part of any team</span>
								<p>Please ask your administrator to add you.</p>
							</div>
							<div className="card-action">
								<a href="/">Take me home!</a>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}});