MyGoals = React.createClass({

	getInitialState() {
		return {contributorEmail:null};
	},

	handleSearch(c) {
		this.setState({contributorEmail:c});
	},

	render() {
		return (
			<div>
				<br/>
				<br/>
				<div>
					<ObjectSearch onClick={this.handleSearch} findContributors={true} findOrganizations={false}/>
				</div>
				<GoalList contributorEmail={this.state.contributorEmail} />
			</div>
		);
	}
});