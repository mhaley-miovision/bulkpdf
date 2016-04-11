import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class ImportPanel extends Component {
	constructor() {
		super();
		this.state = {
			loading: false,
			buttonText: "Import!"
		};
		this.onSubmitForm = this.onSubmitForm.bind(this);
		this.onImportClicked = this.onImportClicked.bind(this);
	}

	onSubmitForm(event) {
		if (event) {
			event.preventDefault();
		}
		if (this.props.showWarning) {
			$("#" + this.props.id).openModal();
		} else {
			// just perform the action immediately
			this.onImportClicked();
		}
	}

	onImportClicked() {
		var _this = this;
		this.setState({loading: true, buttonText: "Importing..."});

		Meteor.call(this.props.method, this.props.importParams, function (err, data) {
			_this.setState({loading: false, buttonText: "Import!"});

			if (err) {
				Materialize.toast("Import failed!", 3000);
			} else {
				Materialize.toast("Import successful!", 3000);
			}

			if (_this.props.resultHandler) {
				_this.props.resultHandler(err, data);
			}
		});
	}

	renderSpinner() {
		if (this.state && this.state.loading) {
			return (
				<div className="progress">
					<div className="indeterminate"></div>
				</div>
			);
		}
	}

	buttonClass() {
		var className = "modal-trigger waves-effect waves-green btn background-main3";
		if (this.state.loading) {
			className += " disabled";
		}
		return className;
	}

	renderWarningDialog() {
		if (this.props.showWarning) {
			return (
				<div id={this.props.id} className="modal">
					<div className="modal-content">
						<h4>Are you sure?</h4>
						<p>Importing will <strong className="red-text">override/delete existing data!</strong></p>
					</div>
					<div className="modal-footer">
						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn background-main3"
						   onClick={this.onImportClicked}>Import!</a>

						<a href="#!" className=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
					</div>
				</div>
			);
		}
	}

	render() {
		return (
			<div className="card-panel white center-align">
				{this.renderWarningDialog()}
				<span className="text-main1">{this.props.label}</span>
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
		);
	}
}

ImportPanel.propTypes = {
	method: React.PropTypes.string.isRequired,
	id: React.PropTypes.string.isRequired,
	label: React.PropTypes.string.isRequired,
	resultHandler: React.PropTypes.func,
	showWarning: React.PropTypes.bool,
	importParams: React.PropTypes.object
};
