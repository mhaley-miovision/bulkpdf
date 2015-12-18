NavbarComponent = React.createClass({
	handleFeedbackClick() {
		console.log(this.refs);
		this.refs.enps.showDialog();
	},

	render() {
		return (
			<nav className="navBar">
				<div className="nav-wrapper teal">
					<ul id="nav-mobile" className="left hide-on-med-and-down">
						<li><a href="/">Home</a></li>
						<li><a href="/tasks">Tasks</a></li>
						<li><a href="/team">Team</a></li>
						<li><a href="/organization">Organization</a></li>
						<li><a href="/profile">Profile</a></li>
						<li><a href="/enps">myENPS</a></li>
					</ul>
					<span className="right">
						<AccountsUIWrapperComponent />
					</span>
				</div>
			</nav>
		);
	}
});