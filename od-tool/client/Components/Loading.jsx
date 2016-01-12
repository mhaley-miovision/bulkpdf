Loading = React.createClass({
	render() {
		return (
			<div className="container">
				<br/>
				<div className="row centeredCard">
					<div className="col s12 m6">
						<div className="card white">
							<div className="card-content teal-text">
								<span className="card-title">Loading...</span>
								<div className="progress">
									<div className="indeterminate"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
})