Navbar = React.createClass({
	handleFeedbackClick() {
		console.log(this.refs);
		this.refs.enps.showDialog();
	},

	componentDidMount() {
		$('.button-collapse').sideNav({
				menuWidth: 300, // Default is 240
				edge: 'left', // Choose the horizontal origin
				closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
			}
		);
		$(".dropdown-button").dropdown();
	},

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
	},

	renderPrivate() {
		return (
			<div className="nav-wrapper background-main2">
				<ul id="nav-mobile" className="left hide-on-med-and-down">
					<li className={FlowHelpers.currentRoute("home")}><a href="/">Home</a></li>
					<li className={FlowHelpers.currentRoute("tasks")}><a href="/tasks">Tasks</a></li>
					<li className={FlowHelpers.currentRoute("team")}><a href="/team">Team</a></li>
					<li className={FlowHelpers.currentRoute("organization")}><a href="/organization">Organization</a></li>
					<li className={FlowHelpers.currentRoute("profile")}><a href="/profile">Profile</a></li>
					<li><a className="dropdown-button" href="#!" data-activates="adminRouteDropdown">Admin<i className="material-icons right">arrow_drop_down</i></a></li>
					<li className={FlowHelpers.currentRoute("enps")}><a href="/enps">myENPS</a></li>
				</ul>
				<ul id="slide-out" className="side-nav">
					<li className={FlowHelpers.currentRoute("home")}><a href="/">Home</a></li>
					<li className={FlowHelpers.currentRoute("tasks")}><a href="/tasks">Tasks</a></li>
					<li className={FlowHelpers.currentRoute("team")}><a href="/team">Team</a></li>
					<li className={FlowHelpers.currentRoute("organization")}><a href="/organization">Organization</a></li>
					<li className={FlowHelpers.currentRoute("profile")}><a href="/profile">Profile</a></li>
					<li className={FlowHelpers.currentRoute("enps")}><a href="/enps">myENPS</a></li>
				</ul>
				<ul id="adminRouteDropdown" className="dropdown-content">
					<li><a href="/admin/import">Import from V1</a></li>
					<li className="divider"></li>
					<li><a href="/admin/roleLabels">Edit Roles</a></li>
				</ul>
				<a href="#" data-activates="slide-out" className="button-collapse"><i className="mdi-navigation-menu"></i></a>
				<div className="right">
					<AccountsUIWrapper />
				</div>
				<div className="right">
					<ProfileImage />
				</div>
		</div>
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
				</div>
			</nav>
		);
	}
});