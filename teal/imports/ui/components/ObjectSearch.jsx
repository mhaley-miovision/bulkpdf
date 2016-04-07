import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { OrganizationsCollection } from '../../api/organizations';
import { ContributorsCollection } from '../../api/contributors';
import { RolesCollection } from '../../api/roles';
import { RoleLabelsCollection } from '../../api/role_labels';
import { AccountabilityLevelsCollection } from '../../api/accountability_levels';

const OBJECT_SEARCH_CLICK_DELAY = 150;

class SearchResults extends Component {
	constructor(props) {
		super(props);
		this.handleOrganizationClick = this.handleOrganizationClick.bind(this);
		this.handleContributorClick = this.handleContributorClick.bind(this);
		this.handleRoleClick = this.handleRoleClick.bind(this);
		this.handleRoleLabelClick = this.handleRoleLabelClick.bind(this);
		this.handleAccountabilityLevelClick = this.handleAccountabilityLevelClick.bind(this);
	}

	handleOrganizationClick(e) {
		e.preventDefault();
		e.stopPropagation();
		// undo what the list creation did. it's nasty but at least contained within this component
		let o = e.currentTarget.text;
		o = o.substr(o.indexOf(" ") + 1);
		this.props.onClick(o, o, 'organization', e.currentTarget.id);
	}
	handleContributorClick(e) {
		e.preventDefault();
		e.stopPropagation();
		// undo what the list creation did. it's nasty but at least contained within this component
		let o = e.currentTarget.text;
		o = o.substr(o.indexOf(" ") + 1);
		this.props.onClick(o, o, 'contributor', e.currentTarget.id);
	}
	handleRoleClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.onClick(e.currentTarget.text, e.currentTarget.id, 'role', e.currentTarget.id);
	}
	handleRoleLabelClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.onClick(e.currentTarget.text, e.currentTarget.text, 'role_label', e.currentTarget.id);
	}
	handleAccountabilityLevelClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.onClick(e.currentTarget.text, e.currentTarget.text, 'accountability_level', e.currentTarget.id);
	}

	getDropdownClasses() {
		var classes = "collection searchDropdown small";
		if (!this.props.showList || this.props.query === '') {
			classes += " hide";
		}
		return classes;
	}

	renderDropdownItems() {
		if (this.props.contributors.length > 0
			|| this.props.organizations.length > 0
			|| this.props.roles.length > 0
			|| this.props.roleLabels.length > 0
			|| this.props.accountabilityLevels.length > 0) {
			var collection = [];
			var i = 0;
			if (this.props.contributors.length > 0) {
				for (var c in this.props.contributors) {
					var o = this.props.contributors[c];
					collection.push(
						<a href="#!" className="collection-item" key={i} id={o.email} object={o} style={{cursor:"pointer"}}
						   onClick={ this.handleContributorClick }><span className="ProjectTag">contributor</span> {o.name}</a>);
					i++;
				}
			}
			if (this.props.organizations.length > 0) {
				for (var c in this.props.organizations) {
					var o = this.props.organizations[c];
					collection.push(
						<a href="#!" className="collection-item" key={i} id={o._id} object={o} style={{cursor:"pointer"}}
						   onClick={  this.handleOrganizationClick }><span className="ProjectTag">organization</span> {o.name}</a>);
					i++;
				}
			}
			if (this.props.roles.length > 0) {
				this.props.roles.forEach(r => {
					let l = (r.contributor ? r.contributor : "<unfilled>") + " - " + r.accountabilityLabel;
					collection.push(
						<a className="collection-item" key={r._id} id={r._id} object={r} style={{cursor:"pointer"}}
						   onClick={ this.handleRoleClick }><span className="ProjectTag">role</span> {l}</a>
					);
				})
			}
			if (this.props.roleLabels.length > 0) {
				this.props.roleLabels.forEach(r => {
					collection.push(
						<a className="collection-item" key={r._id} id={r._id} object={r} style={{cursor:"pointer"}}
						   onClick={ this.handleRoleLabelClick }>{r.name}</a>
					);
				})
			}
			if (this.props.accountabilityLevels.length > 0) {
				this.props.accountabilityLevels.forEach(r => {
					collection.push(
						<a className="collection-item" key={r._id} id={r._id} object={r} style={{cursor:"pointer"}}
						   onClick={ this.handleAccountabilityLevelClick }>{r.name}</a>
					);
				})
			}
			return collection;
		} else {
			return <a href="#!" className="collection-item" onClick={this.onBlur}>{this.props.notFoundLabel}</a>
		}
	}

	render() {
		return (
			<div id='dropdown1' className={this.getDropdownClasses()}>
				{this.renderDropdownItems()}
			</div>
		);
	}
}

var SearchResultsComponent = createContainer((params) => {
	"use strict";

	var handle1 = Meteor.subscribe('teal.organizations');
	var handle2 = Meteor.subscribe('teal.contributors');
	var handle3 = Meteor.subscribe('teal.roles');
	var handle4 = Meteor.subscribe('teal.role_labels');
	var handle5 = Meteor.subscribe('teal.accountability_levels');

	const { query, findOrganizations, findContributors, findRoles, findRoleLabels, findAccountabilityLevels } = params;

	if (handle1.ready() && handle2.ready() && handle3.ready() && handle4.ready() && handle5.ready()) {
		if (query && query !== '') {
			var caseInsensitiveMatch = { $regex: new RegExp('.*' + query + '.*', "i") };
			var q = { name: caseInsensitiveMatch };

			// TODO: nosql injection risk here!?

			// TODO: filter by owned root organization!!!

			var organizationMatches = findOrganizations ? OrganizationsCollection.find(
				q,
				{ fields: {name: 1, _id: 1, id: 1}, sort: {name: 1} }).fetch() : {};
			var contributorMatches = findContributors ? ContributorsCollection.find(
				q,
				{ fields: {name: 1, _id: 1, id: 1, email: 1}, sort: {name: 1} }).fetch() : {};
			var roleMatches = findRoles ? RolesCollection.find(
				{ $or: [{ contributor: caseInsensitiveMatch }, { accountabilityLabel: caseInsensitiveMatch }] },
				{ fields: { _id: 1, accountabilityLabel: 1, email:1, contributor:1 }, sort: { accountabilityLabel: 1 } }
			).fetch() : {};
			var roleLabelMatches = findRoleLabels ? RoleLabelsCollection.find(
				q,
				{ fields: {name: 1}, sort: {name: 1} }).fetch() : {};
			var accountabilityLevelMatches = findAccountabilityLevels ? AccountabilityLevelsCollection.find(
				q,
				{ fields: {name: 1}, sort: {name: 1} }).fetch() : {};

			return {
				isLoading: false,
				contributors: contributorMatches, organizations: organizationMatches,
				roles: roleMatches, roleLabels: roleLabelMatches, accountabilityLevels: accountabilityLevelMatches};
		}
	}
	return { isLoading: true, contributors: [], organizations: [], roles: [], roleLabels: [], accountabilityLevels: []};
}, SearchResults);

export default class ObjectSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showList: false,
			searchResults: [],
			query: props.initialValue
		};

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleOnSelected = this.handleOnSelected.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	toggleDropdown(show) {
		this.setState( { showList: show } );
	}

	// TODO: these methods need refactoring - WAY too much duplication going on.

	handleOnBlur() {
		var _this = this;
		setTimeout(function() {
			_this.toggleDropdown(false);
			_this.setState({showClose:false});
		}, OBJECT_SEARCH_CLICK_DELAY); // TODO HACK: to facilitate clicking first
	}
	handleOnSelected() {
		this.toggleDropdown(true);
		this.setState({showClose:true});
	}
	handleInputChange() {
		this.setState({ query: this.refs.textInput.value });
	}
	handleClear() {
		this.setState({inputValue:'',query:''});
		if (this.props.onClick) {
			this.props.onClick('', '', null);
		}
	}

	componentWillReceiveProps(nextProps, nextState) {
		if (nextProps.initialValue) {
			this.setState({ query: nextProps.initialValue });
		}
	}

	onClick(text, objectId, objectType, obj) {
		this.setState({query:text});
		this.props.onClick(objectId, objectType, obj);
	}

	render() {
		return (
			<div>
				<div className="GoalEditItemInput center">
					<i className="material-icons SearchIcon">search</i>
					<input className="text-main5 ObjectSearch" type="text" id="orgSelection" ref="textInput"
						   onChange={ this.handleInputChange}
						   placeholder={ this.state.query ? '' : this.props.label } value={ this.state.query }
						   onBlur={ this.handleOnBlur } onSelect={ this.handleOnSelected }/>

					{ this.state.showClose ? <i className="material-icons GreyButton ClearGreyButton"
												onClick={ this.handleClear }>close</i> : '' }
				</div>
				<SearchResultsComponent {...this.props} onClick={this.onClick} query={this.state.query} showList={this.state.showList}/>
			</div>
		);
	}
}

ObjectSearch.propTypes = {
	customLabel: React.PropTypes.string,
	findOrganizations: React.PropTypes.bool,
	findContributors: React.PropTypes.bool,
	findRoles: React.PropTypes.bool,
	findRoleLabels: React.PropTypes.bool,
	findAccountabilityLevels: React.PropTypes.bool,
	onClick: React.PropTypes.func.isRequired,
	notFoundLabel: React.PropTypes.string,
	initialValue: React.PropTypes.string
};

ObjectSearch.defaultProps = {
	findContributors: false,
	findOrganizations: false,
	findRoles: false,
	findRoleLabels: false,
	findAccountabilityLevels: false,
	initialValue: ''
};


