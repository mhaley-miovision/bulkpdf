import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'
import ObjectSearch from '../ObjectSearch.jsx'
import OrgListEdit from '../organization/OrgListEdit.jsx'

export default class RoleEdit extends Component {
	constructor(props) {
		super(props);
		this.state = this.loadStateFromProps(props);

		this.handleAddAccountabilitySubmit = this.handleAddAccountabilitySubmit.bind(this);
		this.handleRemoveAccountability = this.handleRemoveAccountability.bind(this);
		this.handleAccountabilityChange = this.handleAccountabilityChange.bind(this);
		this.handleNewAccountabilityChange = this.handleNewAccountabilityChange.bind(this);
		this.handleLabelChange = this.handleLabelChange.bind(this);
		this.onOrganizationSelected = this.onOrganizationSelected.bind(this);
		this.onContributorSelected = this.onContributorSelected.bind(this);
		this.onRoleLabelSelected = this.onRoleLabelSelected.bind(this);
		this.onAccountabilityLevelSelected = this.onAccountabilityLevelSelected.bind(this);
		this.handleIsLeadNodeChanged = this.handleIsLeadNodeChanged.bind(this);
		this.handleIsPrimaryAccountabilityChanged = this.handleIsPrimaryAccountabilityChanged.bind(this);
		this.handleIsExternalChanged = this.handleIsExternalChanged.bind(this);
		this.handleOrgListChanged = this.handleOrgListChanged.bind(this);
	}

	loadStateFromProps(props) {
		return {
			_id: props.role ? props.role._id : null,
			accountabilities: props.role ? _.clone(props.role.accountabilities) : [],
			accountabilityLevel: props.role ? props.role.accountabilityLevel : '', // intermediate
			label: props.role ? _.clone(props.role.label) : "",
			organization: props.role ? props.role.organization : this.props.organization ? this.props.organization: '',
			organizationId: props.role ? props.role.organizationId : this.props.organizationId ? this.props.organizationId : null,
			contributor: props.role ? props.role.contributor : "",
			contributorId: props.role ? props.role.contributorId : null,
			startDatePickerId: 'picker' + Teal.newId(),
			endDatePickerId: 'picker' + Teal.newId(),
			newAccountability: '',
			startDate : props.role ? props.role.startDate : moment().format(Teal.DateFormat),
			endDate : props.role ? props.role.endDate : null,
			isExternal : props.role ? props.role.isExternal : false,
			isLeadNode : props.role ? props.role.isLeadNode : false,
			isPrimaryAccountability: props.role ? props.role.isPrimaryAccountability : true,
			orgList: props.role && props.role.orgList ? _.clone(props.role.orgList) : []
		};
	}

	getInputs() {
		// TODO: this is kind of nasty and a leaky abstraction - there must be a better way to do this (flux/redux?)
		this.state.startDate = $('#' + this.state.startDatePickerId)[0].value;
		this.state.endDate = $('#' + this.state.endDatePickerId)[0].value;
		return this.state;
	}

	handleOrgListChanged(newList) {
		this.setState({orgList:newList});
	}

	clearInputs() {
		// reset to props-derived stated
		this.setState(this.loadStateFromProps(this.props));
	}

	handleAddAccountabilitySubmit(event) {
		event.preventDefault();
		event.stopPropagation();

		if (!!this.state.newAccountability && this.state.newAccountability.trim() !== '') {
			if (event.type === 'submit') {
				event.preventDefault();
			}
			let acc = this.state.accountabilities;
			acc.push({_id: Teal.newId(), name: this.state.newAccountability});
			this.setState({accountabilities: acc, newAccountability: ""});
		}
	}

	handleRemoveAccountability(event) {
		event.preventDefault();
		event.stopPropagation();

		let k = event.target.id.replace("r_","");
		this.state.accountabilities = _.without(this.state.accountabilities, _.findWhere(this.state.accountabilities, {_id: k}));
		this.setState({accountabilities: this.state.accountabilities});
	}
	handleAccountabilityChange(event) {
		event.preventDefault();
		event.stopPropagation();

		let v = event.target.value;
		let k = event.target.id;
		let a = _.find(this.state.accountabilities, o => { return o._id === k });
		if (a) {
			a.name = v;
			this.setState({accountabilities: this.state.accountabilities});
		} else {
			console.error("Accountability with key " + k + " not found!");
		}
	}
	handleNewAccountabilityChange(event) {
		event.preventDefault();
		event.stopPropagation();

		this.setState({newAccountability:event.target.value});
	}
	handleLabelChange(event) {
		this.setState({label:event.target.value});
	}

	renderAccountabilities() {
		var _this = this;
		if (this.state.accountabilities.length > 0) {
			return this.state.accountabilities.map(function(o,i) {
				return (
					<div className="GoalEditItemInput" key={o._id}>
						<input onChange={_this.handleAccountabilityChange}
							   type="text"
							   key={o._id}
							   id={o._id}
							   placeholder={o.name ? '' : "Enter accountability..."}
							   value={o.name}>
						</input>
						<i key={"r_" + o._id} className="material-icons GreyButton ClearGreyButton" id={"r_" + o._id}
						   onClick={_this.handleRemoveAccountability}>close</i>
					</div>
				);
			});
		} else {
			return '';
		}
	}

	componentDidMount() {
		$('#'+this.state.startDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
		$('#'+this.state.endDatePickerId).pickadate({format: Teal.DateFormat.toLowerCase()});
	}

	componentWillReceiveProps(nextProps, nextState) {
		this.setState(this.loadStateFromProps(nextProps));
		this.forceUpdate();
	}

	onOrganizationSelected(org,type,id) {
		this.setState({organization:org,organizationId:id});
	}

	onContributorSelected(contributor,type,id) {
		this.setState({contributor:contributor,contributorId:id});
	}

	onRoleLabelSelected(label) {
		this.setState({label:label});
	}

	onAccountabilityLevelSelected(level) {
		this.setState({accountabilityLevel:level});
	}

	handleIsLeadNodeChanged() {
		this.setState({isLeadNode:!this.state.isLeadNode});
	}
	handleIsPrimaryAccountabilityChanged() {
		this.setState({isPrimaryAccountability:!this.state.isPrimaryAccountability});
	}
	handleIsExternalChanged() {
		this.setState({isExternal:!this.state.isExternal});
	}

	render() {
		let id1 = Teal.newId(), id2 = Teal.newId(), id3 = Teal.newId();
		return (
			<div className="card-content GoalContainer">
				<div className="row">
					<div className="GoalTitle center" style={{marginTop:this.props.goal? "0px":"15px"}}>
						{this.props.role ? "Edit Role" : "New Role"}
					</div>
					<br/>
					<div className="divider"></div>
				</div>
				<div className="row">
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Role Label</label>
						<ObjectSearch
							onClick={this.onRoleLabelSelected} findRoleLabels={true}
							initialValue={this.state.label}
							notFoundLabel="Please type the name of an existing role label."/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Accountability Level</label>
						<ObjectSearch
							onClick={this.onAccountabilityLevelSelected} findAccountabilityLevels={true}
							initialValue={this.state.accountabilityLevel}
							notFoundLabel="Please type the name of an existing accountability level."/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Contributor</label>
						<ObjectSearch
							onClick={this.onContributorSelected} findContributors={true}
							initialValue={this.state.contributor}
							notFoundLabel="Please type the name of an existing contributor."/>
					</div>
					<div className="col m6 s12 GoalContainer">
						<label className="text-main1 GoalSubtitle">Home Organization</label>
						<ObjectSearch
							onClick={this.onOrganizationSelected} findOrganizations={true}
							initialValue={this.state.organization}
							notFoundLabel="Please type the name of an existing organization."/>
					</div>
				</div>
				<div className="row c">
					<div className="GoalTitle center" style={{marginTop:"15px",marginBottom:"15px"}}>
						Contributing Organizations
					</div>
					<div className="col m10 offset-m1 s12">
						<OrgListEdit orgList={this.state.orgList} onChange={this.handleOrgListChanged} ref="orgListInput"/>
					</div>
				</div>
				<div className="row">
					<div className="col m4 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.startDatePickerId}>Start Date</label>
						<input id={this.state.startDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.startDate}
							   readOnly/>
					</div>
					<div className="col m4 s6 GoalContainer">
						<label className="text-main1 GoalSubtitle" htmlFor={this.state.endDatePickerId}>End Date</label>
						<input id={this.state.endDatePickerId} type="date" className="datepicker text-main5"
							   data-value={this.state.endDate}
							   readOnly/>
					</div>
					<div className="col m4 s6" style={{marginTop:"-20px"}}>
						<ul className="text-main1">
							<li key={id1} className="">
								<input ref="isPrimaryAccountabilityInput" id={id1} type="checkbox"
									   readOnly={true} checked={this.state.isPrimaryAccountability} onClick={this.handleIsPrimaryAccountabilityChanged}/>
								<label htmlFor={id1}>Primary Accountability</label>
							</li>
							<li key={id2} className="">
								<input ref="isLeadNodeInput" id={id2} type="checkbox"
									   readOnly={true} checked={this.state.isLeadNode} onClick={this.handleIsLeadNodeChanged}/>
								<label htmlFor={id2}>Lead Node</label>
							</li>
							<li key={id3} className="">
								<input ref="isExternalInput" id={id3} type="checkbox"
									   readOnly={true} checked={this.state.isExternal} onClick={this.handleIsExternalChanged}/>
								<label htmlFor={id3}>External Contributor</label>
							</li>
						</ul>
					</div>
				</div>
				<div className="row">
					<br/>
					<div className="divider"></div>
					<br/>
					<div className="GoalTitle center" style={{marginTop:"15px"}}>
						Accountabilities
					</div>
					<div className="col m10 offset-m1 s12">
						<ul className="ProjectGoalDoneCriteria">
							<form onSubmit={this.handleAddAccountabilitySubmit}>
								<input key="new_ko"
									   type="text"
									   placeholder="Enter new accountability (and press Enter)"
									   onChange={this.handleNewAccountabilityChange}
									   value={this.state.newAccountability}
									   onBlur={this.handleAddAccountabilitySubmit}>
								</input>
							</form>
							{this.renderAccountabilities()}
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

RoleEdit.propTypes = {
	role : React.PropTypes.object
};
