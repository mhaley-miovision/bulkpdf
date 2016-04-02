import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

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
	objectId : React.PropTypes.string,
};

export default createContainer(() => {
	"use strict";

	let handle = Meteor.subscribe("teal.contributors");
	let handle2 = Meteor.subscribe("teal.users");
	if (handle.ready() && handle2.ready()) {
		// default is current user
		let email = this.props.objectId;
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
		return {doneLoading: false};
	}
}, Profile);
