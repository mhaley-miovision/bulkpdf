import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { ContributorsCollection } from '../../../api/contributors';

import Loading from '../Loading.jsx'
import NotOnAnyTeam from '../error_states/NotOnAnyTeam.jsx'
import RolesSummary from '../summary_cards/RolesSummary.jsx'
import GoalsSummary from '../summary_cards/GoalsSummary.jsx'
import TeamsSummary from '../summary_cards/TeamsSummary.jsx'
import SkillsSummary from '../summary_cards/SkillsSummary.jsx'

import Teal from '../../../shared/Teal'

class ProfileOverview extends Component {
	render() {
		if (this.props.doneLoading) {
			if (this.props.contributor) {
				return (
					<div>
						<div className="section">
							<div className="row">
								<div className="col s12 m6">
									<RolesSummary objectId={this.props.contributor.email}/>
								</div>
								<div className="col s12 m6">
									<GoalsSummary objectId={this.props.contributor.email}/>
								</div>
							</div>
							<div className="row">
								<div className="col s12 m6">
									<TeamsSummary objectId={this.props.contributor.email}/>
								</div>
								<div className="col s12 m6">
									<SkillsSummary objectId={this.props.contributor.email}/>
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

ProfileOverview.propTypes = {
	contributor : React.PropTypes.object
};

export default createContainer((params) => {
	"use strict";

	return { doneLoading: true };

	/*
	let handle = Meteor.subscribe("teal.contributors");
	let handle2 = Meteor.subscribe("users");

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
}, ProfileOverview);
