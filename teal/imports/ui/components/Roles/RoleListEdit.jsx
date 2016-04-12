import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import { RolesCollection } from '../../../api/roles'

import ObjectSearch from '../ObjectSearch.jsx'
import RoleItem from '../roles/RoleItem.jsx'

//TODO: this component has a leftover of isEditing that isn't used - should either get rid of it or implement properly
export default class RoleListEdit extends Component {
	constructor(props) {
		super(props);
		this.state = { roles: props && props.roleList ? _.clone(props.roleList) : [] };
		this.handleOnDelete = this.handleOnDelete.bind(this);
		this.handleAddNewRole = this.handleAddNewRole.bind(this);
	}

	handleOnDelete(event) {
		if (event.target.id) {
			let id = event.target.id.replace("r_",""); // this is kind of ugly and breaks encapsulation
			this.setState({roles:_.reject(this.state.roles, r => {return r._id === id})}); // update!
		}
	}

	renderRoles() {
		return this.state.roles.map(role => {
			return <RoleItem key={role._id} role={role}
							 isEditing={this.props.isEditing} onDeleteClicked={this.handleOnDelete}/>
		});
	}

	handleAddNewRole(roleId, type) {
		let r = RolesCollection.findOne({_id:roleId},
			{fields: {_id:1,label:1,accountabilityLabel:1,organizationId:1,contributor:1,email:1,photo:1}});
		if ( _.where(this.state.roles, { _id : roleId }).length != 0 ) {
			Materialize.toast("This role has already been added.", 1000);
		} else {
			this.state.roles.push(r);
			this.setState({roles:this.state.roles}); // update!
			this.refs.roleSearch.handleClear(); // get rid of the role search text
		}
	}

	render() {
		return (
			<div className="GoalOwnersSection">
				{ this.props.heading ?
					<div
						className="GoalSummaryHeadingEdit">{this.props.heading + (this.state.roles.length > 1 ? "s" : "")}</div>
					: ''
				}
				<div className="GoalOwnerPhotos">
					{this.renderRoles()}
				</div>

				<div><ObjectSearch label="Search for role..." notFoundLabel="No matching roles found" onClick={this.handleAddNewRole}
								   findRoles={true} findContributors={false} findOrganizations={false} ref="roleSearch"/></div>
			</div>
		);
	}
}

RoleListEdit.propTypes = {
	roleList : React.PropTypes.array.isRequired,
	heading : React.PropTypes.string,
	compactViewMode : React.PropTypes.bool,
	isEditing: React.PropTypes.bool
};
