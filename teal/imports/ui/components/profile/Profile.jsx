import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { ContributorsCollection } from '../../../api/contributors';

import Loading from '../Loading.jsx'
import ProfileImage from './ProfileImage.jsx'
import RolesSummary from '../summary_cards/RolesSummary.jsx'
import GoalsSummary from '../summary_cards/GoalsSummary.jsx'
import TeamsSummary from '../summary_cards/TeamsSummary.jsx'
import SkillsSummary from '../summary_cards/TeamSkillsSummary.jsx'
import NotOnAnyTeam from '../error_states/NotOnAnyTeam.jsx'

import Teal from '../../../shared/Teal'

class Profile extends Component {
	render() {
		if (this.props.doneLoading) {
			if (this.props.contributor) {
				return (
					<div>
						<div className="section center">
							<ProfileImage width="128px" height="128px"
										  url={Teal.userPhotoUrl(this.props.contributor.photo)}/>
							<h5 className="text-main1">{this.props.contributor.name}</h5>
						</div>
						<div className="divider"></div>

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

Profile.propTypes = {
	objectId : React.PropTypes.string
};

export default createContainer((objectId) => {
	"use strict";

	let handle = Meteor.subscribe("teal.contributors");
	let handle2 = Meteor.subscribe("users");
	if (handle.ready() && handle2.ready()) {
		console.log("ready!");
		// default is current user
		let email = objectId;
		if (!email) {
			var myUser = Meteor.users.findOne({_id: Meteor.userId()});
			email = myUser.services.google.email;
		}
		// find the contributor
		let c = ContributorsCollection.findOne({email: email});
		return {
			contributor: c,
			doneLoading: true
		}
	} else {
		console.log("not ready...");
		return {doneLoading: false};
	}
}, Profile);
