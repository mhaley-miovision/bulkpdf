GoalsForIndividual = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return { contributorPrefix: "My " }
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
		let handle2 = Meteor.subscribe("teal.contributors");
		if (handle.ready() && handle2.ready()) {
			// default is current user
			let objectId = this.props.objectId;
			if (objectId == null) {
				var myUser = Meteor.users.findOne({_id: Meteor.userId()});
				objectId = myUser.email;
			}
			// determine the title prefix
			let prefix = this.props.objectId ? ContributorsCollection.findOne({email: this.props.objectId}).name + "'s " : "My ";
			this.state.contributorPrefix = prefix;

			let allRolestopGoals = RolesCollection.find({email:objectId},{fields:{topGoals:1}}).map(x => {return x.topGoals});
			let goalIds = [];
			allRolestopGoals.forEach(topGoalsForRole => {
				goalIds = goalIds.concat(topGoalsForRole);
			});
			let goals = GoalsCollection.find( {_id: {$in: goalIds} }).fetch();

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
	}});