const TOAST_DURATION = 1000;

GoalStateControls = React.createClass({
	propTypes: {
		goal: React.PropTypes.object
	},

	getInitialState() {
		return {
			state: this.props.goal ? this.props.goal.state : 0
		};
	},

	handleNotStartedClicked()  {
		this.setState({state:0});
	},
	handleInProgressClicked()  {
		this.setState({state:1});
	},
	handleCompletedClicked()  {
		this.setState({state:2});
	},

	render() {
		let classes = "waves-effect waves-light GoalStateButton ";
		let classesNotStarted = classes + (this.state.state == 0 ? "active"  : "");
		let classesInProgress = classes + (this.state.state == 1 ? "active"  : "");
		let classesCompleted = classes + (this.state.state == 2 ? "active" : "");
		return (
			<div>
				<a className={classesNotStarted} onClick={this.handleNotStartedClicked}>Not Started</a>
				<a className={classesInProgress} onClick={this.handleInProgressClicked}>In Progress</a>
				<a className={classesCompleted} onClick={this.handleCompletedClicked}>Complete</a>
			</div>
		);
	}
});

