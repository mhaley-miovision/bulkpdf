import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'

import ObjectSearch from '../ObjectSearch.jsx'

export default class OrgEdit extends Component {
	constructor() {
		super();

		this.state = this.loadStateFromProps(this.props);

		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleOrganizationSelected = this.handleOrganizationSelected.bind(this);
	}

	loadStateFromProps(props) {
		// parent id and name
		let parentId = null;
		let parent = null;
		if (this.props.org) {
			// TODO: clean this up. currently it's an artiface of the rendering logic, which i don't have time to change
			// TODO; ideally the object can expect to have a proper parentid
			if (this.props.org.parent) {
				if (this.props.org.parent._id) {
					// in this case it's an object...
					parentId = this.props.org.parent._id;
					parent = this.props.org.parent.name;
				} else {
					// in this case it's not... ughh
					if (!!this.props.org.parentId) {
						parentId = this.props.org.parentId;
					} else {
						console.error("Expected to find a parentId on org!");
						console.error(this.props.org);
					}
					parent = this.props.org.parent;
				}
			}
		} else {
			if (!!this.props.parentOrgId) {
				parentId = this.props.parentOrgId;
			} else {
				console.error("Expected to find a corresponding parentOrgId for org " + this.props.parentOrg);
				console.error(this.props.org);
			}
			parent = this.props.parentOrg;
		}

		return {
			_id: props.org ? props.org._id : null,
			name: props.org ? props.org.name : '',
			parentOrg: parent ? parent : '',
			parentOrgId: parentId ? parentId : null,
			startDatePickerId: 'picker' + Teal.newId(),
			endDatePickerId: 'picker' + Teal.newId(),
			startDate : props.role ? props.role.startDate : moment().format(Teal.DateFormat),
			endDate : props.role ? props.role.endDate : null,
		};
	}

	getInputs() {
		// TODO: this is kind of nasty and a leaky abstraction - there must be a better way to do this (flux/redux?)
		this.state.startDate = $('#' + this.state.startDatePickerId)[0].value;
		this.state.endDate = $('#' + this.state.endDatePickerId)[0].value;
		return this.state;
	}
	clearInputs() {
		this.setState(this.getInitialState());
	}

	handleNameChange(event) {
		this.setState({name:event.target.value});
	}
	handleOrganizationSelected(orgName,type,id) {
		this.setState({parentOrg:orgName,parentOrgId:id});
	}

	componentDidMount() {
		$('#'+this.state.startDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
		$('#'+this.state.endDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
	}
	componentWillReceiveProps(nextProps, nextState) {
		this.setState(this.loadStateFromProps(nextProps));
		this.forceUpdate();
	}

	render() {
		return (
			<div className="card-content GoalContainer">
				<div className="row">
					<div className="GoalTitle center" style={{marginTop:"15px"}}>
						{this.props.org ? "Edit Organization" : "New Organization"}
					</div>
					<div className="divider"></div>
				</div>
				<div className="row">
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Organization Name</label>
						<input type="text" className="text-main5"
							   value={this.state.name} placeholder={this.state.name ? '' : 'Enter the name of the organization...'}
						       onChange={this.handleNameChange}/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Parent Organization</label>
						<ObjectSearch
							onClick={this.handleOrganizationSelected} findOrganizations={true}
							initialValue={this.state.parentOrg}
							notFoundLabel="Please type the name of an existing organization."/>
					</div>
				</div>
				<div className="row">
					<div className="col m6 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.startDatePickerId}>Start Date</label>
						<input id={this.state.startDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.startDate}
							   readOnly/>
					</div>
					<div className="col m6 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.endDatePickerId}>End Date</label>
						<input id={this.state.endDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.endDate}
							   readOnly/>
					</div>
				</div>
			</div>
		);
	}
}

OrgEdit.propTypes = {
	// TODO: these names are terrible. please do something.
	org : React.PropTypes.object,
	parentOrg : React.PropTypes.string,
	parentOrgId : React.PropTypes.string,
};
