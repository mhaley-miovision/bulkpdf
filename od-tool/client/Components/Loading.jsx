Loading = React.createClass({
	render() {
		return (
			<div className="container centeredCard center">
				<div className="card white">
					<div className="card-content teal-text">
						<span className="card-title">Loading...</span>
						<div className="progress">
							<div className="indeterminate"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
})