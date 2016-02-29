GoalsForRole = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId:React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.roles");
		let handle2 = Meteor.subscribe("teal.goals");
		if (handle.ready() && handle2.ready()) {
			let role = RolesCollection.findOne({_id:this.props.objectId});
			if (!role) {
				return { doneLoading: true, notFound: true }
			}
			let goals = GoalsCollection.find({_id: { $in : role.topGoals }});
			if (!goals) {
				return { doneLoading: true, notFound: true }
			}
			return { goals: goals, doneLoading: true };
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
			if (this.data.notFound) {
				return <NotFound/>
			}
			return <GoalList goalList={this.data.goals}/>
		} else {
			return <div><Loading /><br/><br/></div>
		}
	},

	render() {
		return (
			<div>
				<br/>

				{this.renderGoals()}

				<br/>
				<br/>

			</div>
		);
	}
});