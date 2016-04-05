import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
var ReactTooltip = require("react-tooltip")

import Teal from '../../../../shared/Teal'

export default class GoalUserPhotoList extends Component {
	constructor() {
		super();
		this.state = { tipId : Teal.newId() };
	}

	gotoUserProfile(elt) {
		let email = elt.currentTarget.id;
		let url = FlowRouter.path("profile", {}, {objectId: email});
		FlowRouter.go(url);
	}

	renderPhotos() {
		return this.props.list.map(item => {
			let dataTip = (item.contributor ? item.contributor : "<unassigned>") + ("<br>" + item.accountabilityLabel);
			return (
				<img id={item.email} key={item._id} className="goalItemPhoto" src={Teal.userPhotoUrl(item.photo)}
				 data-for={this.state.tipId} data-tip={dataTip} onClick={this.gotoUserProfile}/>
			);
		});
	}

	render() {
		if (this.props.list.length > 0) {
			let heading = '';
			if (this.props.heading) {
				let text = this.props.heading + (this.props.list.length > 1 ? "s" : "");
				heading = [];
				heading.push(<div key={Teal.newId()} className="GoalOwnersSection GoalSummaryHeading hide-on-small-only">{text}</div>);
				heading.push(<div key={Teal.newId()} className="GoalOwnersSectionMobile GoalSummaryHeading hide-on-med-and-up center">{text}</div>);
			}
			return (
				<div className="GoalOwnersSection">
					{heading}
					<div className="GoalOwnerPhotos">{this.renderPhotos()}</div>
					<ReactTooltip multiline={true} id={this.state.tipId}/>
				</div>
			);
		} else {
			return false;
		}
	}
}

GoalUserPhotoList.propTypes = {
	list : React.PropTypes.array.isRequired,
	heading : React.PropTypes.string,
	compactViewMode : React.PropTypes.bool,
};
