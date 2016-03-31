import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import TealChanges from '../../../shared/TealChanges'
import Permissions from '../../../api/permissions'

class Requests extends Component {

	renderChanges() {
		if (this.props.doneLoading) {
			return this.props.changes.map(c => {
				return <ChangeItem key={c._id} change={c}/>
			})
		}
	}

	renderClearButton() {
		if (Permissions.isAdmin()){
			return (
				<div className="center">
					<a className="waves-effect waves-light btn" onClick={this.clearChangeList}>Clear</a>
					<br/>
					<br/>
				</div>
			);
		}
	}

	clearChangeList() {
		Meteor.call("teal.changes.clearList");
	}

	render() {
		if (this.props.doneLoading) {
			return (
				<div>
					<br/>
					<header>
						<h3 className="center header text-main1">Change List</h3>
					</header>
					<br/>

					{this.renderClearButton()}

					<div className="collection">
						{this.renderChanges()}
					</div>

					<br/>

					<ReactTooltip html={true} multiline={true} place="bottom"/>
				</div>
			);
		} else {
			return <Loading />
		}
	}
}

export default createContainer(() => {
	"use strict";

	let handle = Meteor.subscribe('teal.changes');
	if (handle.ready()) {
		let r = ChangesCollection.find({},{sort:{createdAt:-1}}).fetch();
		return { doneLoading: true, changes: r };
	}
	return { doneLoading: false };

}, Requests);
