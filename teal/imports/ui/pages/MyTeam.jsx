import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Loading from '../components/Loading.jsx'
import ObjectSearch from '../components/ObjectSearch.jsx'
import Organization from '../components/organization/Organization.jsx'
import GoalsForOrganization from '../components/goals/GoalsForOrganization.jsx'
import TeamSkillsSummary from '../components/summary_cards/TeamSkillsSummary.jsx'

class MyTeam extends Component {
	constructor() {
		super();
		this.state = {orgName: '', orgId: ''};
		this.handleSearch = this.handleSearch.bind(this);
	}

	handleSearch(orgName, type, id) {
		this.setState({orgName: orgName, orgId: id});
	}

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
					<GoalsForOrganization orgId={orgId}/>
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
	}
}

export default createContainer(() => {
	"use strict";

	var handle = Meteor.subscribe("teal.contributors");
	var handle2 = Meteor.subscribe("users");

	if (handle.ready() && handle2.ready()) {
		var c = ContributorsCollection.findOne({email: Meteor.user().email});
		var o = null;
		if (c) {
			o = OrganizationsCollection.findOne({_id: c.physicalOrgId});
		}
		return {
			isLoading: false,
			contributor: c,
			contributorOrg: o ? o.name : '',
			contributorOrgId: c ? c.physicalOrgId : ''
		};
	} else {
		return {isLoading: true};
	}
}, MyTeam);
