NavbarComponent = React.createClass({
	handleFeedbackClick() {
		console.log(this.refs);
		this.refs.enps.showDialog();
	},

	renderPublic() {
		return (
			<ul id="nav-mobile" className="left hide-on-med-and-down">

			</ul>
		);
	},

	renderPrivate() {
		return (
			<ul id="nav-mobile" className="left hide-on-med-and-down">
				<li className={FlowHelpers.currentRoute("home")}><a href="/">Home</a></li>
				<li className={FlowHelpers.currentRoute("tasks")}><a href="/tasks">Tasks</a></li>
				<li className={FlowHelpers.currentRoute("team")}><a href="/team">Team</a></li>
				<li className={FlowHelpers.currentRoute("organization")}><a href="/organization">Organization</a></li>
				<li className={FlowHelpers.currentRoute("profile")}><a href="/profile">Profile</a></li>
				<li className={FlowHelpers.currentRoute("enps")}><a href="/enps">myENPS</a></li>
			</ul>
		);
	},

	renderNavContent() {
		if (!Meteor.userId()) {
			return this.renderPublic();
		} else {
			return this.renderPrivate();
		}
	},

	render() {
		return (
			<nav className="navBar">
				<div className="nav-wrapper background-main2">
					{this.renderNavContent()}
					<span className="right">
						<AccountsUIWrapperComponent />
					</span>
				</div>
			</nav>
		);
	}
});