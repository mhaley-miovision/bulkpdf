const TOAST_DURATION = 1000;

// Role component - represents a single role
GoalStateControls = React.createClass({
	propTypes: {
		// This component gets the goal to display through a React prop.
		// We can use propTypes to indicate it is required
		goal: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			state: this.props.goal.state
		};
	},

	handleNotStartedClicked()  {
		Meteor.call("setGoalState", this.props.goal._id, 0);
	},
	handleInProgressClicked()  {
		Meteor.call("setGoalState", this.props.goal._id, 1);
	},
	handleCompletedClicked()  {
		Meteor.call("setGoalState", this.props.goal._id, 2);
	},

	componentDidMount() {
		$(document).ready(function(){
			$('.collapsible').collapsible({
				accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
			});
		});
	},

	render() {
		let classes = "waves-effect waves-light goalStateButton ";
		let classesNotStarted = classes + (this.props.goal.state == 0 ? "active"  : "");
		let classesInProgress = classes + (this.props.goal.state == 1 ? "active"  : "");
		let classesCompleted = classes + (this.props.goal.state == 2 ? "active" : "");
		return (
			<div className="right">
				<a className={classesNotStarted} onClick={this.handleNotStartedClicked}>Not Started</a>
				<a className={classesInProgress} onClick={this.handleInProgressClicked}>In Progress</a>
				<a className={classesCompleted} onClick={this.handleCompletedClicked}>Complete</a>
			</div>
		);
	}
});

