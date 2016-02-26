GoalSubGoals = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	propTypes: {
		compactViewMode: React.PropTypes.bool,
	},

	getDefaultProps() {
		var objectId = FlowRouter.getQueryParam("objectId");
		if (objectId) {
			return {
				objectId: objectId
			}
		}
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.goals");
		if (handle.ready()) {
			if (!!this.props.objectId) {
				// all immediate children of this goal
				let goals = GoalsCollection.find({parent: this.props.objectId}).fetch();
				let goalName = GoalsCollection.findOne({_id: this.props.objectId}, {fields: {name: 1}}).name;
				return {goals: goals, doneLoading: true, goalName: goalName};
			} else {
				return { isBlank : true };
			}
		} else {
			return { doneLoading : false };
		}
	},

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.objectId !== this.props.objectId) {
			return true;
		}
		return false;
	},

	renderGoals() {
		if (this.data.doneLoading) {
			return <GoalList goalList={this.data.goals} compactViewMode={this.props.compactViewMode} />
		} else {
			return <div><Loading /><br/><br/></div>
		}
	},
	render() {
		if (this.data.isBlank) {
			return <div/>
		} else {
			if (this.props.compactViewMode) {
				return this.renderGoals();
			} else {
				return (
					<div>
						<br/>
						<header>
							<h5 className="center header text-main1">{this.data.doneLoading ? this.data.goalName : "..."}</h5>
						</header>
						<br/>
						{this.renderGoals()}
						<br/>
						<br/>
					</div>
				);
			}
		}
	}
});