MyOrganization = React.createClass({

	getInitialState() {
		return {
			org: "Miovision",
			mode: 'acc',
		};
	},

	handleOrgChanged(o) {
		if (this.refs.org) {
			this.refs.org.zoomToOrg(o);
		} else {
			this.refs.tree.zoomToOrg(o);
		}
	},

	componentDidMount: function() {
	},

	renderOrganization() {
		return <Organization ref="org" org={this.state.org} roleMode={true} roleModeVisible={true} searchVisible={true}/>;
	},

	renderAccountabilities() {
		return <Tree ref="tree" org={this.state.org} roleMode={this.state.roleMode}/>;
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

	handleSearch(o) {
		TreeView.zoomToNodeByName(o);
	},

	render() {
		return (
			<div className="container">
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

