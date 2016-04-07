import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router'
import { createContainer } from 'meteor/react-meteor-data';

import { GoalsCollection } from '../../../api/goals'
import { RolesCollection } from '../../../api/roles'
import { ContributorsCollection } from '../../../api/contributors'

import ObjectSearch from '../ObjectSearch.jsx'
import GoalsForIndividual from './GoalsForIndividual.jsx'

export default class GoalsForIndividualWithSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {objectId: null};
		this.handleSearch = this.handleSearch.bind(this);
	}
	handleSearch(name, type, id) {
		this.setState({objectId: id});
	}
	renderGoals() {
		if (this.props.doneLoading) {
			return <GoalList goalList={ this.props.goals }/>
		} else {
			return <div><Loading /><br/><br/></div>
		}
	}
	render() {
		return (
			<div>
				<ObjectSearch
					onClick={this.handleSearch}
					findContributors={true} findOrganizations={false}
					label="Type here to search for a contributor..."
					notFoundLabel="Please type the name of an existing contributor."/>
				<GoalsForIndividual objectId={this.state.objectId}/>
			</div>
		);
	}
}
