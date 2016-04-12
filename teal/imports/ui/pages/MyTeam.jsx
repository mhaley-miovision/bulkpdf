import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import Teal from '../../shared/Teal'

import { ContributorsCollection } from '../../api/contributors'
import { OrganizationsCollection } from  '../../api/organizations'
import { RolesCollection } from  '../../api/roles'

import Loading from '../components/Loading.jsx'
import ObjectSearch from '../components/ObjectSearch.jsx'
import Tabs from '../components/Tabs.jsx'
import Organization from '../components/organization/Organization.jsx'
import GoalsForOrganization from '../components/goals/GoalsForOrganization.jsx'
import TeamSkillsSummary from '../components/summary_cards/TeamSkillsSummary.jsx'
import NotOnAnyTeam from '../components/error_states/NotOnAnyTeam.jsx'

class MyTeam extends Component {
	constructor(props) {
		console.log("constructor #1");
		super(props);
		this.state = {
			orgName: props.orgName,
			orgId: props.orgId,
			tab: 'acc_tab',
			tabItems: [ { id: "acc_tab", name: "Accountabilities" }, { id: "org_tab", name: "Composition" } ]
		};
		this.handleTabClicked = this.handleTabClicked.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleNavigateToParentOrg = this.handleNavigateToParentOrg.bind(this);
		console.log("constructor #2");
	}

	handleSearch(orgName, type, id) {
		this.setState({orgName: orgName, orgId: id});
	}

	handleTabClicked(tabId) {
		this.setState({tab:tabId});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.orgName && nextProps.orgId) {
			this.setState({orgName: nextProps.orgName, orgId: nextProps.orgId});
		}
	}

	getNavigateableParentOrg() {
		let o = OrganizationsCollection.findOne({_id:this.state.orgId},{field:{parentId:1}});
		if (!!o && !!o.parentId) {
			return OrganizationsCollection.findOne({_id: o.parentId},{field:{name:1,_id:1}});
		}
	}
	handleNavigateToParentOrg() {
		let p = this.getNavigateableParentOrg();
		if (!!p) {
			this.handleSearch(p.name, Teal.ObjectTypes.Organization, p._id);
		}
	}
	renderUpButton() {
		if (this.props.showUpButton) {
			let parent = this.getNavigateableParentOrg();
			if (parent) {
				return (
					<div className="center">
						<i style={{fontSize:"23px",padding:0}} className="material-icons GreyButtonSmall"
						   data-tip="Go to parent organization" onClick={this.handleNavigateToParentOrg}>arrow_upward</i>
						<br/>
					</div>
				);
			}
		}
	}

	renderActiveTab() {
		if (this.state.tab === 'acc_tab') {
			return (
				<div className="row">
					<GoalsForOrganization orgId={this.state.orgId}/>
					<div>
						{this.renderUpButton()}
						<Organization objectId={this.state.orgId} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
				</div>
			);
		} else if (this.state.tab === 'org_tab') {
			return (
				<div className="row">
					<div>
						{this.renderUpButton()}
						<Organization objectId={this.state.orgId} roleMode={true} roleModeVisible={true} searchVisible={false}/>
					</div>
					<TeamSkillsSummary orgId={this.state.orgId}/>
				</div>
			);
		}
	}

	render() {
		if (this.props.isLoading) {
			return <Loading/>;
		} else if (this.props.contributor && this.state.orgName) {
			return (
				<div className="section">
					<header>
						<h5 className="center header text-main1">Team</h5>
					</header>
					<div className="row">
						<div className="col m6 offset-m3 s12">
							<Tabs selectedItemId={this.state.tab} items={this.state.tabItems} onClick={this.handleTabClicked}/>
						</div>
					</div>
					<ObjectSearch onClick={this.handleSearch}
								  findOrganizations={true} findContributors={false}
								  label="Search for another team..."
								  notFoundLabel="Please type the name of an existing organization."/>
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

MyTeam.propTypes = {
	showUpButton: React.PropTypes.bool
};
MyTeam.defaultProps = {
	showUpButton: true
};

export default createContainer((params) => {
	"use strict";

	var handle = Meteor.subscribe("teal.contributors");
	var handle2 = Meteor.subscribe("teal.organizations");
	var handle3 = Meteor.subscribe("teal.roles");

	if (handle.ready() && handle2.ready() && handle3.ready()) {
		var c = ContributorsCollection.findOne({email: Meteor.user().email});
		var o = null;

		// try the physical org, if defined
		if (c) {
			o = OrganizationsCollection.findOne({_id: c.physicalOrgId});
		}

		if (c && !o) {
			// TODO: temporary hack until revamp of roles with multiple parent orgs is implemented
			// find all roles this person plays, and just return the first one
			let roles = RolesCollection.find({$or: [{contributorId: c._id},{contributorId: c.email}] },{fields:{organizationId:1}}).fetch();
			if (roles.length > 0) {
				o = OrganizationsCollection.findOne({_id: roles[0].organizationId});
			}
		}
		let contributorOrgId = o && o._id ? o._id : '';

		console.log("Returning done loading...");
		return {
			isLoading: false,
			contributor: c,
			orgName: o ? o.name : '',
			orgId: c ? contributorOrgId : ''
		};
	} else {
		return {isLoading: true};
	}
}, MyTeam);
