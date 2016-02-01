MyOrganization = React.createClass({

	getInitialState() {
		return {
			org: "Miovision",
			mode: 'acc',
		};
	},

	componentDidMount: function() {
	},

	renderOrganization() {
		return <Organization ref="org" objectName={this.state.org} objectType="organization" roleMode={true} roleModeVisible={true} searchVisible={true}/>;
	},

	renderAccountabilities() {
		return <Tree ref="tree" objectName="" objectType="organization"/>;
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
					<a className={this.getClasses(this.state.mode != 'acc')} onClick={this.handleAccClicked}>Accountabilities</a>
					<a className={this.getClasses(this.state.mode != 'comp')} onClick={this.handleCompClicked}>Team Composition</a>
				</div>
				<div>
					{this.renderBody()}
				</div>
			</div>
		);
	}
});

