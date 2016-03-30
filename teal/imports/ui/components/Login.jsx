import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class Login extends Component {
	componentDidMount() {
		console.log(Meteor.user());

		var _this = this;
		setTimeout (function() {
			if (_this.refs.titlePrefix) {
				ReactDOM.findDOMNode(_this.refs.titlePrefix).className += " productTitlePrefixTextAnimate";
			}
		}, 500);
		setTimeout (function() {
			if (_this.refs.title) {
				ReactDOM.findDOMNode(_this.refs.title).className += " productTitleTextAnimate";
			}
		}, 1000);
		setTimeout (function() {
			if (_this.refs.subtitle) {
				ReactDOM.findDOMNode(_this.refs.subtitle).className += " productSubtitleAnimate";
			}
		}, 2000);
	}

	render() {
		return (
			<div className="row">
				<div className="col s12 m6 offset-m3 centeredCard">
					<div className="card center">
						<div className="card-content">
							<span className="card-title activator text-main5">
								<span ref="titlePrefix" className="productTitlePrefixText">Miovision</span>
								.<span ref="title" className="productTitleText">Teal</span>
							</span>
							<br/>
							<span ref="subtitle" className="productSubtitle">Organizational Management Software</span>
						</div>
						<div className="card-action">
							<AccountsUIWrapper />
						</div>
					</div>
				</div>
			</div>
		);
	}
}
