import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import { OrganizationsCollection } from '../../../api/organizations'

import ObjectSearch from '../ObjectSearch.jsx'
import OrgListEditItem from './OrgListEditItem.jsx'

export default class OrgListEdit extends Component {
	constructor(props) {
		super(props);
		this.state = { orgs: props && props.orgList ? _.clone(props.orgList) : [] };
		this.handleOnDelete = this.handleOnDelete.bind(this);
		this.handleAddNewOrg = this.handleAddNewOrg.bind(this);
	}

	handleOnDelete(event) {
		if (event.target.id) {
			let id = event.target.id.replace("r_",""); // this is kind of ugly and breaks encapsulation
			this.setState({orgs:_.reject(this.state.orgs, o => {return o._id === id})}); // update!
		}
	}

	renderOrganizations() {
		return this.state.orgs.map(org => {
			return <OrgListEditItem key={org._id} org={org} onDeleteClicked={this.handleOnDelete}/>
		});
	}

	handleAddNewOrg(orgName, type, orgId) {
		if ( _.where(this.state.orgs, { _id : orgId }).length != 0 ) {
			Materialize.toast("This organization has already been added.", 1000);
		} else {
			let o = OrganizationsCollection.findOne({_id:orgId},
				{fields: {_id:1,name:1}});
			this.state.orgs.push(o);
			// forces update
			this.setState({orgs:this.state.orgs}); // update!
			this.refs.orgSearch.handleClear(); // get rid of the role search text
			this.props.onChange(this.state.orgs);
		}
	}

	render() {
		return (
			<div>
				{ this.props.heading &&
					<div className="GoalSubtitle center text-main1">{this.props.heading + (this.state.orgs.length > 1 ? "s" : "")}</div>
				}
				<div className="center">
					{this.renderOrganizations()}
				</div>

				<div><ObjectSearch label="Enter organization..." notFoundLabel="No matching organizations found" onClick={this.handleAddNewOrg}
								   findRoles={false} findContributors={false} findOrganizations={true} ref="orgSearch"/></div>
			</div>
		);
	}
}

OrgListEdit.propTypes = {
	orgList : React.PropTypes.array.isRequired,
	heading : React.PropTypes.string,
	compactViewMode : React.PropTypes.bool,
	onChange : React.PropTypes.func.isRequired
};
