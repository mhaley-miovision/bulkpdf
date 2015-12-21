WelcomeComponent = React.createClass({
	render() {
		return (
			<div className="welcome">
				<div className="row centeredCard">
					<div className="col s12 m7">
						<div className="card">
							<div className="card-content">
								<span className="card-title activator text-main1">Organizational Design Tool<i className="material-icons right">more_vert</i></span>
							</div>
							<div className="card-action">
								<p><a href="#" className="activator">Click here for a tour.</a></p>
							</div>
							<div className="card-reveal">
								<span className="card-title grey-text text-darken-4">Getting Started<i className="material-icons right">close</i></span>
								<p>To get started, please select one of the top menu items. If you would like you see
									a tutorial on how to use the tool, please email
									<a href="mailto:vleipnik@miovision.com"> Victor Leipnik</a></p>
							</div>
						</div>
					</div>
				</div>
			</div>
			);
	}});