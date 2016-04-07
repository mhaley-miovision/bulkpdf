import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { ContributorsCollection } from '../../api/contributors'
import { OrganizationsCollection } from  '../../api/organizations'

import Loading from '../components/Loading.jsx'
import ObjectSearch from '../components/ObjectSearch.jsx'
import Tabs from '../components/Tabs.jsx'
import Organization from '../components/organization/Organization.jsx'
import GoalsForOrganization from '../components/goals/GoalsForOrganization.jsx'
import TeamSkillsSummary from '../components/summary_cards/TeamSkillsSummary.jsx'
import NotOnAnyTeam from '../components/error_states/NotOnAnyTeam.jsx'

class MyTeam extends Component {
	constructor() {
		super();
		this.state = {
			orgName: '',
			orgId: '',
			tab: 'acc_tab',
			tabItems: [ { id: "acc_tab", name: "Accountabilities" }, { id: "org_tab", name: "Team Composition" } ]
		};
		this.handleTabClicked = this.handleTabClicked.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}

	handleSearch(orgName, type, id) {
		this.setState({orgName: orgName, orgId: id});
	}

	handleTabClicked(tabId) {
		this.setState({tab:tabId});
	}

	renderActiveTab() {
		var org = this.state.orgName ? this.state.orgName : this.props.contributorOrg;
		var orgId = this.state.orgId ? this.state.orgId : this.props.contributorOrgId;

		if (this.state.tab === 'acc_tab') {
			return (
				<div className="row">
					<GoalsForOrganization orgId={orgId}/>
					<div>
						<Organization objectId={org} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
				</div>
			);
		} else if (this.state.tab === 'org_tab') {
			return (
				<div className="row">
					<div>
						<Organization objectId={org} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
					<TeamSkillsSummary orgId={org}/>
				</div>
			);
		}
	}

	render() {
		if (this.props.isLoading) {
			return <Loading/>;
		} else if (this.props.contributor && (this.state.orgName || this.props.contributorOrg)) {
			return (
				<div className="section">
					<ObjectSearch onClick={this.handleSearch}
								  findOrganizations={true} findContributors={false}
								  label="Search for another team..."
								  notFoundLabel="Please type the name of an existing organization."/>

					<div className="row">
						<div className="col s6 offset-s3">
							<br/>
							<Tabs selectedItemId={this.state.tab} items={this.state.tabItems} onClick={this.handleTabClicked}/>
						</div>
					</div>

					{this.renderActiveTab()}
				</div>
			);
		} else {
			return (
				<NotOnAnyTeam/>
			);
		}
	}
}

export default createContainer((params) => {
	"use strict";

	var handle = Meteor.subscribe("teal.contributors");
	var handle2 = Meteor.subscribe("teal.organizations");

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
