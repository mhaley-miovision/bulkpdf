MyProfile = React.createClass({

	render() {
		return (
			<div className="row">
				<div className="col s12 m8 offset-m2 centeredCard">
					<div className="card white darken-1">
						<div className="card-image waves-effect waves-block waves-light centeredItem">
							<ProfileImage width="128px" height="128px"/>
						</div>
						<div className="card-content center">
							<span className="card-title">My Profile</span>
							<p className="grey-text">Welcome to your profile, {Meteor.user().profile.name}.</p>
							<p className="grey-text">Stay tuned for new features, all about YOU!</p>
						</div>
						<div className="card-action">
							<a href="/">Take me home!</a>
						</div>
					</div>
				</div>
			</div>
		);
	}});