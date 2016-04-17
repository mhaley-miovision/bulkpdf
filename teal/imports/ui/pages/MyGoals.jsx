import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import GoalsForIndividualWithSearch from '../components/goals/GoalsForIndividualWithSearch.jsx'
import GoalTreeByRole from '../components/goals/tree/GoalTreeByRole.jsx'
import GoalsForCompany from '../components/goals/GoalsForCompany.jsx'

import Tabs from '../components/Tabs.jsx'

export default class MyGoals extends Component {
	constructor(props) {
		super(props);
		this.handleTabClicked = this.handleTabClicked.bind(this);
		this.state = {
			tab: 'individual',
			tabItems: [ { id: 'individual', name: 'Individual' }, { id: 'all_goals', name: 'Company' }, { id: 'goal_tree', name: 'Tree' } ]
		};
	}

	handleTabClicked(tabId) {
		this.setState({tab:tabId});
	}

	renderActiveTab() {
		if (this.state.tab === 'individual') {
			return <GoalsForIndividualWithSearch />
		} else if (this.state.tab === 'all_goals') {
			return <GoalsForCompany />
		} else if (this.state.tab === 'goal_tree') {
			return <GoalTreeByRole />
		}
	}

	render() {
		return (
			<div>
				<div className="row">
					<header>
						<br/>
						<h5 className="center header text-main1">Goals</h5>
					</header>
					<div className="col m6 offset-m3 s12">
						<Tabs items={this.state.tabItems} onClick={this.handleTabClicked}/>
					</div>
				</div>
				<div className="row">
					{ this.renderActiveTab() }
				</div>
			</div>
		);
	}
}
