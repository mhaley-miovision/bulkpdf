MyProfile = React.createClass({

	render() {
		return (
			<div className="row centeredCard">
				<div className="col s12 m6">
					<div className="card blue-grey darken-1">
						<div className="card-image waves-effect waves-block waves-light centeredItem">
							<ProfileImage width="128px" height="128px"/>
						</div>
						<div className="card-content white-text center">
							<span className="card-title">My Profile</span>
							<p>Welcome to your profile, {Meteor.user().profile.name}.</p>
							<p>Stay tuned for new features, all about YOU!</p>
						</div>
						<div className="card-action">
							<a href="/">Take me home!</a>
						</div>
					</div>
				</div>
			</div>
		);
	}});