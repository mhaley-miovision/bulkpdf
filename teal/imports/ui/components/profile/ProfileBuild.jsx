import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { ContributorsCollection } from '../../../api/contributors';

import Loading from '../Loading.jsx'
import ProfileImage from './ProfileImage.jsx'
import RolesSummary from '../summary_cards/RolesSummary.jsx'
import GoalsSummary from '../summary_cards/GoalsSummary.jsx'
import TeamsSummary from '../summary_cards/TeamsSummary.jsx'
import SkillsSummary from '../summary_cards/SkillsSummary.jsx'
import NotOnAnyTeam from '../error_states/NotOnAnyTeam.jsx'

import Teal from '../../../shared/Teal'

class ProfileBuild extends Component {
	render() {
		if (this.props.doneLoading) {
			if (this.props.contributor) {
				return (
					<div className="row centeredCard">
						<div className="col s12 m6 offset-m3">
							<div className="card blue-grey darken-1">
								<div className="card-content white-text center">
									<span className="card-title">Not yet implemented</span>
									<p>Once completed, this page will enable you to build your profile.</p>
								</div>
							</div>
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

ProfileBuild.propTypes = {
	contributor : React.PropTypes.object.isRequired
};

export default createContainer((params) => {
	"use strict";

	return { doneLoading: true };

/*

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
	}*/
}, ProfileBuild);
