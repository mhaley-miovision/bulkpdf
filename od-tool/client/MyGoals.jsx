MyGoals = React.createClass({

	getInitialState() {
		return {objectId:null};
	},

	handleSearch(c) {
		this.setState({objectId:c});
	},

	render() {
		return (
			<div>
				<br/>
				<br/>
				<div>
					<ObjectSearch
						onClick={this.handleSearch}
						findContributors={true} findOrganizations={false}
						notFoundLabel="Please type the name of an existing contributor."/>
				</div>
				<GoalsForIndividual objectId={this.state.objectId} />
			</div>
		);
	}
});