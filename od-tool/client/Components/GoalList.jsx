GoalList = React.createClass({
	// This mixin makes the getMeteorData method work
	//mixins: [ReactMeteorData],

	getInitialState() {
		return { doneLoading: false }
	},

	getInitialProps() {
		return { addingGoalsEnabled: false }
	},

	componentDidMount() {
		var _this = this;
		Meteor.call("loadGoalTreeForContributor", function (err, data) {
			console.log(data);

			if (err) {
				console.error(err);
			} else {
				_this.setState({doneLoading: true, goals: data});
			}
		});

		$(document).ready(function(){
			$('.collapsible').collapsible({
				accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
			});
		});
	},

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.goals) {
			if (typeof(this.state) === 'undefined' || typeof(this.state.goals) === 'undefined'
				|| this.state.goals._id != nextState.goals._id) {
				console.log("shouldComponentUpdate YES");
				return true;
			}
		}
		console.log("shouldComponentUpdate NO");
		return false;
	},

	renderGoals() {
		if (this.state.doneLoading) {
			console.log(this.state.goals);

			return this.state.goals.children.map(goal => {
				console.log("goal.name = " + goal.name);
				console.log("goal._id = " + goal._id);
				return <Goal
					key={goal._id}
					goal={goal}/>;
			});
		}
	},
	render() {
		return (
			<div>
				<br/>

				<header>
					<h3 className="center header text-main1">My Goals</h3>
				</header>

				<br />

				<ul className="collapsible" data-collapsible="accordion">
					{this.renderGoals()}
				</ul>

				<br/>
				<br/>

			</div>);
	}});