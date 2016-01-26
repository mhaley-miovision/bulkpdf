ImportGoals = React.createClass({
	getInitialState() {
		return {
			loading: false,
			buttonText: "Import!"
		};
	},

	onSubmitForm(event) {
		if (event) {
			event.preventDefault();
		}

		$("#doImportModal").openModal();
	},

	doImport() {
		var self = this;
		this.setState({loading: true, buttonText: "Importing..."});

		Meteor.call("importGoals", function (err, data) {
			self.setState({loading: false, buttonText: "Import!"});

			if (err) {
				Materialize.toast("Import failed!", 3000);
			} else {
				Materialize.toast("Import completed successfully!", 3000);
			}
		});
	},

	renderSpinner() {
		if (this.state && this.state.loading) {
			return (
				<div className="progress">
					<div className="indeterminate"></div>
				</div>
			);
		}
	},

	buttonClass() {
		var className = "modal-trigger waves-effect waves-green btn background-main3";
		if (this.state.loading) {
			className += " disabled";
		}
		return className;
	},

	render() {
		return (
			<div className="card white darken-1">
				<div className="card-content center-align">

					<div id="doImportModal" className="modal">
						<div className="modal-content">
							<h4>Are you sure?</h4>
							<p>Importing from Spreadsheet <strong className="red-text">will delete all existing goal data!</strong></p>
						</div>
						<div className="modal-footer">
							<a href="#!" className=" modal-action modal-close waves-effect waves-green btn background-main3"
								onClick={this.doImport}>Import!</a>

							<a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
						</div>
					</div>

					<span className="card-title text-main1">Import Company Goals</span>

					<br />
					{this.renderSpinner()}
					<br />

					<form onSubmit={this.onSubmitForm}>
						<div className="row centeredItem">
							<div className="modal-footer">
								<a href="#" className={this.buttonClass()}
									onClick={this.onSubmitForm}>{this.state.buttonText}</a>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	}});