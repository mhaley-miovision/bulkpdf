import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../../shared/Teal'

import { GoalsCollection } from '../../../../api/goals'
import { RolesCollection } from '../../../../api/roles'

import Loading from '../../Loading.jsx'
import ObjectSearch from '../../ObjectSearch.jsx'
import GoalTree from './GoalTree.jsx'

class GoalTreeByRole extends Component {
	constructor(props) {
		super(props);
		this.state = { roleId:this.props.roleId };
		this.handleSearch = this.handleSearch.bind(this);
	}

	renderSearch() {
		if (this.props.searchVisible) {
			return (
				<div>
					<ObjectSearch onClick={this.handleSearch} findRole={true} findOrganizations={false}/>
				</div>
			);
		}
	}

	handleSearch(roleId) {
		this.setState({roleId:roleId});
	}

	render() {
		if (this.props.doneLoading) {
			return (
				<div>
					{this.renderSearch()}
					<GoalTree goalsRoot={this.props.goalsRoot}/>
				</div>
			);
		} else {
			return <Loading />
		}
	}
}

GoalTreeByRole.propTypes = {
	roleId: React.PropTypes.string,
};

export default createContainer((params) => {
	"use strict";

	var handle = Meteor.subscribe("teal.goals");
	var handle2 = Meteor.subscribe("teal.roles");
	if (handle.ready() && handle2.ready()) {

		// default role is the CEO - TODO: make sure to filter by org root id in the future
		let roleId = null;

		let r = RolesCollection.findOne({label: "Chief Executive Officer"});
		if (!!r) {
			roleId = r._id;
		} else {
			console.error("Couldn't find the CEO role for this org!");
		}

		// find all nodes with this contributor as owner, sorted by depth
		let goals = GoalsCollection.find({$or: [
			{ ownerRoles: { $elemMatch : {_id: roleId} }},
			{ contributorRoles: { $elemMatch : {_id: roleId} }}
		]}, {sort: {depth:1}}).fetch();

		// remove all nodes which are sub-children
		let i = 0;
		while (i < goals.length) {
			let g = goals[i];

			// remove all sub children, i.e. that contain this id in their path
			let j = i+1;
			while (j < goals.length) {
				if (goals[j].path.indexOf(g._id) >= 0) {
					goals.splice(j, 1);
				} else {
					j++; // only increment if we didn't remove the element
				}
			}
			// next top level node
			i++;
		}

		// we now have this role's top level goals. create a fake root to house them
		let root = {
			name: "Company Goals",
			ownerRoles: [r],
			contributorRoles: [],
			state: 0,
			path: [],
			parent: null,
			isLeaf: false,
			children: [],
			stats: {completed:0,inProgress:0,notStarted:0}
		}
		goals.forEach(g => {
			root.children.push(g);
			root.stats.completed += g.stats.completed;
			root.stats.inProgress += g.stats.inProgress;
			root.stats.notStarted += g.stats.notStarted;
			populateGoalChildren(g, true);
		});

		return {doneLoading: true, goalsRoot: root};
	} else {
		return {doneLoading: false};
	}
}, GoalTreeByRole);

function populateGoalChildren(n, recurse = true) {
	n.children = [];
	var query = GoalsCollection.find({parent: n._id}); // find the children
	if (query.count() > 0) {
		var r = query.fetch();
		for (var x in r) {
			n.children.push(r[x]); // add the child
			if (recurse) {
				populateGoalChildren(r[x]); // recurse for each child
			}
		}
	}
}
