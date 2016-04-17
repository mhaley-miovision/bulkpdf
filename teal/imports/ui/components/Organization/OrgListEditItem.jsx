import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Teal from '../../../shared/Teal'

export default class OrgListEditItem extends Component {
	render() {
		let o = this.props.org;
		//<a href={ FlowRouter.path("organizationView", {}, {objectId: o._id}) } className="text-main">
		return (
			<div className="TealChip" style={{cursor:"pointer"}}
				 data-tip={o.name}>
				{o.name}
				<i className="material-icons " onClick={this.props.onDeleteClicked} id={"r_"+o._id}>close</i>
			</div>
		);
	}
}

OrgListEditItem.propTypes = {
	org: React.PropTypes.object.isRequired,
	onDeleteClicked: React.PropTypes.func.isRequired
};
