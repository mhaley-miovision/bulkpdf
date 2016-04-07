import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { ContributorsCollection } from '../../../api/contributors';

import Loading from '../Loading.jsx'
import ProfileImage from './ProfileImage.jsx'
import NotOnAnyTeam from '../error_states/NotOnAnyTeam.jsx'

import Teal from '../../../shared/Teal'

import Tabs from '../Tabs.jsx'
import ProfileOverview from './ProfileOverview.jsx';
import ProfileCareer from './ProfileCareer.jsx';
import ProfileBuild from './ProfileBuild.jsx';

class Profile extends Component {
	constructor(props) {
		super(props);
		this.handleTabClicked = this.handleTabClicked.bind(this);
		this.state = {
			tab: 'career',
			tabItems: [
				{ id: "overview", 	name: "Overview" },
				{ id: "career", 	name: "Career" },
				{ id: "configure",	name: "Configure" }
			]};
	}
	handleTabClicked(tabId) {
		this.setState({tab:tabId});
	}
	renderActiveTab() {
		if (this.state.tab === 'overview') {
			return <ProfileOverview contributor={this.props.contributor}/>;
		} else if (this.state.tab === 'career') {
			return <ProfileCareer contributor={this.props.contributor}/>;
		} else if (this.state.tab === 'configure') {
			return <ProfileBuild contributor={this.props.contributor}/>;
		}
	}
	render() {
		if (this.props.doneLoading) {
			if (this.props.contributor) {
				return (
					<div>
						<div className="row">
							<div className="col s12 section center">
								<ProfileImage width="128px" height="128px"
											  url={this.props.contributor.photo}/>
								<h5 className="text-main1">{this.props.contributor.name}</h5>
							</div>

							<div className="row">
								<div className="col s6 offset-s3">
									<br/>
									<Tabs selectedItemId={this.state.tab} items={this.state.tabItems} onClick={this.handleTabClicked}/>
								</div>
							</div>

							<div className="divider"></div>

							{ this.renderActiveTab() }
						</div>
					</div>
				);
			} else {
				return <NotOnAnyTeam/>;
			}
		} else {
			return <Loading />;
		}
	}
}

Profile.propTypes = {
	objectId : React.PropTypes.string
};

export default createContainer((params) => {
	"use strict";

	let handle = Meteor.subscribe("teal.contributors");
	let handle2 = Meteor.subscribe("users");

	const { objectId } = params;

	if (handle.ready() && handle2.ready()) {

		// no objectId specified => user currently logged in user
		let c = null;
		if (!!objectId) {
			// find the contributor
			c = ContributorsCollection.findOne(
				{$or:
					[	// match on either the email or the id for users inside this root org
						{$and: [ {email: objectId}, {rootOrgId: Teal.rootOrgId()} ]},
						{$and: [ {_id: objectId}, {rootOrgId: Teal.rootOrgId()} ]}
					]
				}
			);
		} else {
			c = ContributorsCollection.findOne({rootOrgId: Teal.rootOrgId(), email:Teal.currentUserEmail()})
		}

		return {
			contributor: c,
			doneLoading: true
		}
	} else {
		return { doneLoading: false };
	}
}, Profile);
