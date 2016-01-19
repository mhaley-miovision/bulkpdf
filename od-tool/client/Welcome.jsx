Welcome = React.createClass({
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
	},

	render() {
		return (
			<div className="welcome">
				<div className="row centeredCard">
					<div className="col s12 m7">
						<div className="card">
							<div className="card-content">
								<span className="card-title activator text-main5">Welcome to <span ref="titlePrefix" className="productTitlePrefixText">Miovision</span>.
									<span ref="title" className="productTitleText">Teal</span>
									<i className="material-icons right">more_vert</i></span>
								<br/>
								<span ref="subtitle" className="productSubtitle">Organizational Management Software</span>
							</div>
							<div className="card-action">
								<p><a href="#" className="activator grey-text">Click here for a tour.</a></p>
							</div>
							<div className="card-reveal">
								<span className="card-title grey-text text-darken-4">Getting Started<i className="material-icons right">close</i></span>
								<p>To get started, please select one of the top menu items.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			);
	}});