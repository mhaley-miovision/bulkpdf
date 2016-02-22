NotOnAnyTeam = React.createClass({
	render() {
		return (
			<div className="row centeredCard">
				<div className="col s12 m6 offset-m3">
					<div className="card blue-grey darken-1">
						<div className="card-content white-text">
							<span className="card-title">You are not part of any team</span>
							<p>Please ask your administrator to add you.</p>
						</div>
						<div className="card-action">
							<a href="/">Take me home!</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
})