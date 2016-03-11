MyGoals = React.createClass({

	getInitialState() {
		return {objectId:null};
	},

	handleSearch(name, type, id) {
		this.setState({objectId:id});
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