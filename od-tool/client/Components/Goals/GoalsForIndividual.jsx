GoalsForIndividual = React.createClass({
	// This mixin makes the getMeteorData method work
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

			// find all nodes with this contributor as owner, sorted by depth
			let goals = GoalsCollection.find({$or: [
					{ ownerRoles: { $elemMatch : {email: objectId} }},
					{ contributorRoles: { $elemMatch : {email: objectId} }}
			]}, {sort: {depth:1}}).fetch();

			// remove all nodes which are sub-children
			let i = 0;
			while (i < goals.length) {
				let g = goals[i];
				if (g.depth === 0) {
					goals.splice(j, 1);
					continue;
				}

				// remove all sub children, i.e. that contain this id in their path
				let j = i+1;
				while (j < goals.length) {
					if (goals[j].path.indexOf(g._id) >= 0) {
						goals.splice(j, 1);
					} else {
						j++; // only increment if we didn't remove the element
					}
				}
				// next top level node
				i++;
			}
			return { goals: goals, doneLoading: true };
		} else {
			return { doneLoading : false };
		}
	},

	componentDidMount() {
		$(document).ready(function(){
			$('.collapsible').collapsible({
				accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
			});
		});
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