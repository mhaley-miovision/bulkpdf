MyOrganization = React.createClass({

	getInitialState() {
		return {
			objectName: this.props.objectName,
			objectType: this.props.objectType,
			zoomTo: this.props.zoomTo,
			mode: this.props.mode,
		};
	},

	getDefaultProps() {
		return {
			objectName: "Miovision",
			zoomTo: "Miovision",
			objectType: "organization",
			mode: 'comp',
		}
	},

	componentDidMount: function() {
	},

	renderOrganization() {
		return <Organization ref="org"
							 objectName={this.state.objectName} objectType={this.state.objectType}
							 roleMode={this.props.roleMode} roleModeVisible={true}
							 searchVisible={true} zoomTo={this.state.zoomTo}/>;
	},

	renderAccountabilities() {
		return <Tree ref="tree" objectName={this.state.objectName} objectType={this.state.objectType}/>;
	},

	handleAccClicked() {
		console.log("handleAccClicked")
		this.setState({ mode: 'acc'});
		this.forceUpdate();
	},

	handleCompClicked() {
		console.log("handleCompClicked")
		this.setState({ mode: 'comp'});
		this.forceUpdate();
	},

	getClasses(isDisabled) {
		return "waves-effect waves-light btn" + (isDisabled ? " disabled" : "");
	},

	renderBody() {
		if (this.state.mode === 'acc') {
			return this.renderAccountabilities();
		} else {
			return this.renderOrganization();
		}
	},

	render() {
		return (
				<div>
				<div className="section center">
					<div className="section center">
						<a className={this.getClasses(this.state.mode != 'acc')}
						   onClick={this.handleAccClicked}>Accountabilities</a>
						<a className={this.getClasses(this.state.mode != 'comp')}
						   onClick={this.handleCompClicked}>Team Composition</a>
					</div>
				</div>
				<div>
					{this.renderBody()}
				</div>
			</div>
		);
	}
});

