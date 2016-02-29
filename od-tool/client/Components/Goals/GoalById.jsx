const TOAST_DURATION = 1000;

// Role component - represents a single role
GoalById = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		goalId: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.goals");
		if (handle.ready() && !!this.props.goalId) {
			// all immediate children of this goal
			let goal = GoalsCollection.findOne({_id: this.props.goalId});
			return { doneLoading : true, goal:goal };
		} else {
			return { doneLoading : false };
		}
	},

	render() {
		if (this.data.doneLoading) {
			if (this.data.goal) {
				return <Goal goal={this.data.goal}/>
			} else {
				return <NotFound/>
			}
		} else {
			return <Loading spinner={true}/>
		}
	}
});

