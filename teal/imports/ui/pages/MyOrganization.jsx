import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Organization from '../components/organization/Organization.jsx'
import GoalTreeByRole from '../components/goals/tree/GoalTreeByRole.jsx'

import NotImplementedYet from '../components/error_states/NotImplementedYet.jsx'
import Tabs from '../components/Tabs.jsx'

export default class MyOrganization extends Component {

	constructor(props) {
		super(props);

		this.state = {
			tab: 'acc_tab',
			tabItems: [ { id: "acc_tab", name: "Accountabilities" }, { id: "org_tab", name: "Team Composition" } ]
		};

		this.handleTabClicked = this.handleTabClicked.bind(this);
	}

	renderOrganization() {
		return <Organization ref="org" objectId="Miovision" objectType="organization"
							 roleMode={true} roleModeVisible={true} searchVisible={true}/>
	}

	renderAccountabilities() {
		return <GoalTreeByRole />
	}

	handleTabClicked(tabId) {
		this.setState({tab:tabId});
	}

	renderBody() {
		if (this.state.mode === 'acc') {
			return this.renderAccountabilities();
		} else {
			return this.renderOrganization();
		}
	}

	render() {
		return (
			<div className="row">
				<div className="col s6 offset-s3">
					<br/>
					<Tabs items={this.state.tabItems} onClick={this.handleTabClicked}/>
				</div>
				<div id="test1" className="col s12">{this.state.tab === 'acc_tab' ? this.renderAccountabilities() : this.renderOrganization() }</div>
			</div>
		);
	}
}

