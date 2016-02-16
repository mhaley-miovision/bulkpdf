Navbar = React.createClass({


	handleFeedbackClick() {
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

	renderListIems(id, className) {
		//<li className={FlowHelpers.currentRoute("home")}><a href="/">Home</a></li>
		//<li className={FlowHelpers.currentRoute("tasks")}><a href="/tasks">Tasks</a></li>
		return (
			<ul id={id} className={className}>
				<li className={FlowHelpers.currentRoute("profile")}><a href="/">Profile</a></li>
				<li className={FlowHelpers.currentRoute("goals")}><a href="/goals">Goals</a></li>
				<li className={FlowHelpers.currentRoute("team")}><a href="/team">Team</a></li>
				<li className={FlowHelpers.currentRoute("organization")}><a href="/organization">Organization</a></li>
				<li className={FlowHelpers.currentRoute("admin")}><a href="/admin">Admin</a></li>
				<li className={FlowHelpers.currentRoute("enps")}><a href="/enps">myENPS</a></li>
			</ul>
		);
	},

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
				{this.renderNavContent()}
			</nav>
		);
	}
});