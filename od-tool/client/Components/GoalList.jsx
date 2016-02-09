GoalList = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	getInitialState() {
		return { contributorPrefix: "My " }
	},

	getMeteorData() {
		let handle = Meteor.subscribe("goals");
		if (handle.ready()) {
			// default is current user
			let contributorEmail = this.props.contributorEmail;
			if (contributorEmail == null) {
				var myUser = Meteor.users.findOne({_id: Meteor.userId()});
				contributorEmail = myUser.services.google.email;
			}
			// determine the title prefix
			let prefix = this.props.contributorEmail ? ContributorsCollection.findOne({email: this.props.contributorEmail}).name + "'s " : "My ";
			this.state.contributorPrefix = prefix;

			// find all nodes with this contributor as owner, sorted by depth
			let goals = GoalsCollection.find({owners: contributorEmail}, {sort: {depth:1}}).fetch();
			console.log("Found " + goals.length + " owned goals.");

			// remove all nodes which are sub-children
			let i = 0;
			while (i < goals.length) {
				let g = goals[i];
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
			console.log("Trimmed down to " + goals.length + " owned top level goals.");
			console.log(goals);

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
		if (nextProps.contributorEmail !== this.props.contributorEmail) {
			return true;
		}
		return false;
	},

	renderGoals() {
		if (this.data.doneLoading) {
			return this.data.goals.map(goal => {
				console.log("goal.name = " + goal.name);
				console.log("goal._id = " + goal._id);
				return <Goal
					key={goal._id}
					goal={goal}/>;
			});
		} else {
			return <Loading />
		}
	},
	render() {
		return (
			<div>
				<br/>

				<header>
					<h4 className="center header text-main1">{this.state.contributorPrefix}Goals</h4>
				</header>

				<br />

				<ul className="collapsible" data-collapsible="accordion">
					{this.renderGoals()}
				</ul>

				<br/>
				<br/>

			</div>);
	}});