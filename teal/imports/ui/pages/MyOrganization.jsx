import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Organization from '../components/organization/Organization.jsx'
import GoalTreeByRole from '../components/goals/tree/GoalTreeByRole.jsx'

export default class MyOrganization extends Component {

	constructor(props) {
		super(props);

		this.state = {};
		this.state.zoomTo = props && props.zoomTo ? props.zoomTo : '';
		this.state.mode = props && props.mode ? props.mode : 'acc';

		/*
		this.state.objectId = props && props.objectId ? props.objectId : '';
		this.state.objectType = props && props.objectType ? props.objectType : 'organization';
		this.state.mode = props && props.mode ? props.mode : 'acc';
		*/

		this.handleAccClicked = this.handleAccClicked.bind(this);
		this.handleCompClicked = this.handleCompClicked.bind(this);
	}

	renderOrganization() {
		return <Organization ref="org"
							 objectId="Miovision" objectType="organization"
							 roleMode={true} roleModeVisible={true}
							 searchVisible={true}
							 zoomTo={this.state.zoomTo}/>;
	}

	renderAccountabilities() {
		return <GoalTreeByRole />
	}

	handleAccClicked() {
		this.setState({mode: 'acc'});
		this.forceUpdate();
	}

	handleCompClicked() {
		this.setState({mode: 'comp'});
		this.forceUpdate();
	}

	getClasses(isDisabled) {
		return "waves-effect waves-light btn" + (isDisabled ? " disabled" : "");
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
			<div>
				<div className="section center">
					<div className="section center">
						<a className={this.getClasses(this.state.mode != 'acc')}
						   onClick={this.handleAccClicked}>Accountabilities</a>
						<a className={this.getClasses(this.state.mode != 'comp')}
						   onClick={this.handleCompClicked}>Team Composition</a>
					</div>
				</div>
				<div>
					{this.renderBody()}
				</div>
			</div>
		);
	}
}

