import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Permissions from '../../api/permissions';
import Routing from '../../api/routing';
import { ChangesCollection } from '../../api/changes';
import Teal from '../../shared/Teal';

import AccountsUIWrapper from './accounts/AccountsUIWrapper.jsx';
import ProfileImage from './profile/ProfileImage.jsx';

class Navbar extends Component {

	renderPublic() {
		return (
			<div className="nav-wrapper background-main2">
				<ul id="nav-mobile" className="left hide-on-med-and-down">

				</ul>
				<span className="right">
					<AccountsUIWrapper />
				</span>
			</div>
		);
	}

	renderChangesCount() {
		if (this.props.changesCount) {
			//darken-3 orange
			return <span className="new badge background-main1 white-text">{this.props.changesCount}</span>;
		}
	}

	renderListIems(id, className) {
		//<li className={FlowHelpers.currentRoute("home")}><a href="/">Home</a></li>
		//<li className={FlowHelpers.currentRoute("tasks")}><a href="/tasks">Tasks</a></li>
		return (
			<ul id={id} className={className}>
				<li className={Routing.currentRoute("profile")}><a href="/">Profile</a></li>
				<li className={Routing.currentRoute("goals")}><a href="/goals">Goals</a></li>
				<li className={Routing.currentRoute("team")}><a href="/team">Team</a></li>
				<li className={Routing.currentRoute("organization")}><a href="/organization">Organization</a></li>
				{ Permissions.isDesigner() ?
					<li className={Routing.currentRoute("designer")}><a href="/designer">Design</a>
					</li>
					: ''
				}
				<li className={Routing.currentRoute("requests")}><a href="/requests">Changes{this.renderChangesCount()}</a></li>
				{
					Permissions.isAdmin() ?
						<li className={Routing.currentRoute("admin")}><a href="/admin">Admin</a></li>
						: ''
				}
				<li className={Routing.currentRoute("enps")}><a href="/enps">myENPS</a></li>
			</ul>
		);
	}

	renderPrivate() {
		return (
			<div className="nav-wrapper background-main2">
				{this.renderListIems("nav-mobile", "left hide-on-med-and-down")}
				{this.renderListIems("slide-out", "side-nav")}
				<a href="#" data-activates="slide-out" className="button-collapse"><i className="mdi-navigation-menu"></i></a>
				<div className="right">
					<AccountsUIWrapper />
				</div>
				<div className="right">
					<ProfileImage />
				</div>
				{ Permissions.isAdmin() ? <div className="right">{Teal.rootOrgIg()}</div> : '' }
			</div>
		);
	}

	renderNavContent() {
		if (!Meteor.userId() || !Permissions.isEnabled()) {
			return this.renderPublic();
		} else {
			return this.renderPrivate();
		}
	}

	render() {
		return (
			<nav className="navBar">
				{this.renderNavContent()}
			</nav>
		);
	}
}

export default createContainer(() => {
	var h = Meteor.subscribe("teal.changes")
	if (h.ready()) {
		return {
			changesCount: ChangesCollection.find().count()
		};
	}
	return {};
}, Navbar);
