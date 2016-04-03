import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import ObjectSearch from '../components/ObjectSearch.jsx'
import GoalsForIndividual from '../components/goals/GoalsForIndividual.jsx'

export default class MyGoals extends Component {

	constructor() {
		super();
		this.state = {objectId: null};
		this.handleSearch = this.handleSearch.bind(this);
	}

	handleSearch(name, type, id) {
		this.setState({objectId: id});
	}

	render() {
		return (
			<div>
				<br/>
				<br/>
				<div>
					<ObjectSearch
						onClick={this.handleSearch}
						findContributors={true} findOrganizations={false}
						label="Type here to search for a contributor..."
						notFoundLabel="Please type the name of an existing contributor."/>
				</div>
				<GoalsForIndividual objectId={this.state.objectId}/>
			</div>
		);
	}
}
