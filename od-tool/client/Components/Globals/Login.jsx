LoginComponent = React.createClass({
	render() {
		return (
			<div className="welcome-public">
				<div className="row centeredCard">
					<div className="col s12 m7">
						<div className="card center">
							<br /><br />
							<div className="card-content">
								<span className="card-title text-main1">Organizational Design Tool</span>
							</div>
							<div className="card-content">
								<AccountsUIWrapperComponent />
							</div>
							<br /><br />
						</div>
					</div>
				</div>
			</div>

		);
	}
});