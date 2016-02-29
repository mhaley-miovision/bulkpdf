GoalTreeByGoalId = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		goalId: React.PropTypes.string.isRequired,
	},

	getDefaultProps() {
		return {
			searchVisible: true,
		}
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.goals");
		if (handle.ready()) {
			let goalId = this.state.objectId;

			// get the entire branch
			let goals = GoalsCollection.find({path: goalId}).fetch();

			// append children for tree accessibility
			goals.forEach(g => {
				var children = _.where(goals, {parent: goalId});
				g.children = children;
			});

			// return the root
			let g = _.where(goals, {_id: goalId});

			return {doneLoading: true, goalsRoot: g};
		} else {
			return {doneLoading: false};
		}
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<GoalTree goalsRoot={this.data.goalsRoot}/>
				</div>
			);
		} else {
			return <Loading />
		}
	}
});