Loading = React.createClass({
	propTypes: {
		spinner : React.PropTypes.bool,
	},
	getDefaultProps() {
		return {
			spinner: false,
		}
	},

	render() {
		if (this.props.spinner) {
			return (
				<div className="valign-wrapper centeredItem">
					<br/><br/><br/><br/><br/>
					<div className="preloader-wrapper small active">
						<div className="spinner-layer spinner-teal">
							<div className="circle-clipper left">
								<div className="circle"></div>
							</div>
							<div className="gap-patch">
								<div className="circle"></div>
							</div>
							<div className="circle-clipper right">
								<div className="circle"></div>
							</div>
						</div>
					</div>
					<br/><br/><br/><br/><br/>
				</div>
			);
		} else {
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
	}
})