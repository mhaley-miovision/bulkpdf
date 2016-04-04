import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { RolesCollection } from '../../../api/roles'
import { ContributorsCollection } from '../../../api/contributors'

import Loading from '../Loading.jsx'

class TeamsSummary extends Component {

	renderOrgControls(o) {
		let controls = [];

		// TODO: implement actually jumping to the role, not the contributor
		var url = FlowRouter.path("organizationView", {}, { objectId: o, objectType:"organization"});

		// public controls
		controls.push(
			<a key={o} href={url} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">search</i>
			</a>
		);

		return controls;
	}

	renderTeams() {
		if (this.props.doneLoading) {
			return this.props.orgs.map(o => {
				return (
					<li className="collection-item" key={o}>
						<div className="collection-item-text">
							{o}
						</div>
						{this.renderOrgControls(o)}
					</li>
				);
			});
		}
	}

	render() {
		if (this.props.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Teams</li>
						{this.renderTeams()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
}

TeamsSummary.propTypes = {
	objectId: React.PropTypes.string.isRequired,
};

export default createContainer((params) => {
	"use strict";

	let handle = Meteor.subscribe("teal.contributors");
	let handle2 = Meteor.subscribe("teal.roles");

	const { objectId } = params;

	if (handle.ready() && handle2.ready()) {
		let orgs = _.uniq(RolesCollection.find({email:objectId}, {
			sort: {organization: 1}, fields: {organization: true}
		}).fetch().map(function(x) {
			return x.organization;
		}), true);

		let homeOrg = ContributorsCollection.findOne({email:objectId}).physicalTeam;

		return { doneLoading: true, orgs: orgs, homeOrg: homeOrg }
	} else {
		return { doneLoading: false };
	}
}, TeamsSummary);
