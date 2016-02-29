MyOrganization = React.createClass({

	getInitialState() {
		return {
			objectId: this.props.objectId,
			objectType: this.props.objectType,
			zoomTo: this.props.zoomTo,
			mode: this.props.mode,
		};
	},

	getDefaultProps() {
		return {
			objectId: "",
			zoomTo: "",
			objectType: "role",
			mode: 'acc',
		}
	},

	componentDidMount: function() {
	},

	renderOrganization() {
		return <Organization ref="org"
							 objectId="Miovision" objectType="organization"
							 roleMode={true} roleModeVisible={true}
							 searchVisible={true} zoomTo={this.state.zoomTo}/>;
	},

	renderAccountabilities() {
		// default role is CEO
		return <GoalTreeByRole />
		//return <Tree ref="tree" objectId={this.state.objectId} objectType={this.state.objectType}/>;
	},

	handleAccClicked() {
		this.setState({ mode: 'acc'});
		this.forceUpdate();
	},

	handleCompClicked() {
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

