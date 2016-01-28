ENPS = React.createClass({
	getInitialState() {
		return {
			enpsRating: null,
			enpsReason: "",
			recentlySubmitted: false
		};
	},

	onEnpsReasonChanged: function(event) {
		this.setState({ enpsReason: event.target.value });
	},

	onEnpsChanged: function(e) {
		this.setState({	enpsRating: e.currentTarget.value });
		this.refs.enpsReason.focus();
	},

	onSubmitForm: function(event) {
		if (event) {
			event.preventDefault();
		}

		if (this.state.enpsRating != null && !this.state.recentlySubmitted) {
			Meteor.call("submitEnps", this.state.enpsRating, this.state.enpsReason);
			this.state.recentlySubmitted = true;
			// prevent accidental repeated submission
			var self = this;
			setTimeout( function() { self.setState({recentlySubmitted: false}); }, 3000);

			Materialize.toast("Thank you for your feedback. Keep letting us know how we're doing!", 3000);
		} else {
			Materialize.toast("Please provide a rating prior to submission.", 2000);
		}
	},

	setIconClass: function(testEnpsValue) {
		return this.state.enpsRating == testEnpsValue ? "enpsIcon-selected" : "enpsIcon";
	},

	render() {
		return (
			<div className="container">
				<br/>
				<div className="row center">
					<div className="col s12 m8 offset-m2">
						<div className="card white darken-1">
							<div className="card-content center-align">
								<span className="card-title text-main1">Let us know how you're feeling today.</span>

								<br />
								<br />

								<form onSubmit={this.onSubmitForm}>

									<div className="row">
										<div className="col s4">
											<label>
												<input className="validate required" type="radio" name="enps_value" value="1"
													   onChange={this.onEnpsChanged}/>
												<img className={this.setIconClass("1")} src="img/enps-icons/happy.jpg" />
											</label>
										</div>
										<div className="col s4">
											<label>
												<input className="validate required" type="radio" name="enps_value" value="0"
													   onChange={this.onEnpsChanged}/>
												<img className={this.setIconClass("0")} src="img/enps-icons/neutral.jpg" />
											</label>
										</div>
										<div className="col s4">
											<label>
												<input className="validate required" type="radio" name="enps_value" value="-1"
													   onChange={this.onEnpsChanged}/>
												<img className={this.setIconClass("-1")} src="img/enps-icons/sad.jpg" />
											</label>
										</div>
									</div>

									<div className="row">
										<div className="col s12 center">
											<input placeholder="(Optional) I feel this way because..." id="enps_reason" ref="enpsReason" type="text"
												   className="validate required" onChange={this.onEnpsReasonChanged}/>
										</div>
									</div>

									<div className="row centeredItem">
										<div className="modal-footer">
											<a href="#" className=" modal-action modal-close waves-effect waves-green btn background-main3"
											   onClick={this.onSubmitForm}>Submit</a>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}});