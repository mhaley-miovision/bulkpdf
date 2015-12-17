ENPSComponent = React.createClass({
	getInitialState() {
		return {
			enps: null,
			enpsReason: "",
			submitted: false
		};
	},

	handleChange: function(event) {
		this.setState({enpsReason: event.target.value});
	},
	setHappy() {
		this.setState({enps: 1});
	},
	setNeutral() {
		this.setState({enps: 0});
	},
	setSad() {
		this.setState({enps: -1});
	},

	handleSubmit: function(event) {
		if (event) {
			event.preventDefault();
		}

		if (this.state.enps != null && !this.state.submitted) {
			Meteor.call("submitNew", this.state.enps, this.state.enpsReason);
			this.state.submitted = true;
			$('#thanksModal').openModal();
		}
	},

	setIconClass: function(testEnpsValue) {
		return this.state.enps == testEnpsValue ? "enpsIcon-selected" : "enpsIcon";
	},

	render() {
		return (
			<div className="row centeredCard center">
				<div className="col s12 m6">
					<div className="card white darken-1">
						<div className="card-content teal-text">
							Let us know how you're feeling today!
						</div>

						<br/>

						<div className="row">
							<div className="col s4"><a href="#" onClick={this.setHappy}>
								<img className={this.setIconClass(1)} src="img/enps-icons/happy.png" alt="Happy"/></a></div>
							<div className="col s4"><a href="#" onClick={this.setNeutral}>
								<img className={this.setIconClass(0)} src="img/enps-icons/neutral.png" alt="Neutral"/></a></div>
							<div className="col s4"><a href="#" onClick={this.setSad}>
								<img className={this.setIconClass(-1)} src="img/enps-icons/sad.png" alt="Sad"/></a></div>
						</div>

						<div className="container">
							<div className="row">
								<div className="input-field col s12">
									<form onSubmit={this.handleSubmit}>
										<input placeholder="(Optional) I feel this way because..." id="enps_reason" ref="enpsReason" type="text"
											   className="validate" onChange={this.handleChange}/>
									</form>
								</div>
							</div>
						</div>

						<div className="card-action">
							<a href="#" onClick={this.handleSubmit}>Give Feedback</a>
							<a href="/">Return Home</a>
						</div>
					</div>
				</div>

				<div id="thanksModal" className="modal">
					<div className="modal-content">
						<h4>Thank you</h4>
						<p>Your feedback is valued and appreciated. Keep lettings us know how we're doing!</p>
					</div>
					<div className="modal-footer">
						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
					</div>
				</div>
			</div>
		);
	}});