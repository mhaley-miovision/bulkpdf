GoalList = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	getInitialProps() {
		return { addingGoalsEnabled: false }
	},

	// Loads items from the Goals collection and puts them on this.data.goals
	getMeteorData() {
		var handle1 = Meteor.subscribe("goals");
		var handle2 = Meteor.subscribe("users");
		var isLoading = !(handle1.ready() && handle2.ready());
		var goals = {};

		if (!isLoading) {
			var myUser = Meteor.users.findOne({_id: Meteor.userId()});
			var myEmail = myUser.services.google.email;
			goals = GoalsCollection.find({owners: myEmail}).fetch();
		}
		return {
			isLoading: isLoading,
			goals: goals,
			currentUser: Meteor.user()
		};
	},

	getInitialState() {
		return {
		}
	},

	renderGoals() {
		if (!this.data.isLoading) {
			return this.data.goals.map((goal) => {
				return <Goal
					key={goal._id}
					goal={goal}/>;
			});
		}
	},

	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		Meteor.call("addGoal", text, function(err, data) {

			console.error(err);
			/*
			if (err && err.error == "duplicate") {
				Materialize.toast("That label already exists, item was not added.", 3000);
			}*/
		});

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	},

	render() {
		return (
			<div>
				<br/>

				<header>
					<h3 className="center header text-main1">My Goals</h3>
				</header>

				<br />

				{ this.data.currentUser && this.props.addingGoalsEnabled ?
					<form className="new-goal" onSubmit={this.handleSubmit} >
						<input
							type="text"
							ref="textInput"
							placeholder="Type to add new goal" />
					</form> : ''
				}

				<ul className="collection">
					{this.renderGoals()}
				</ul>

				<br/>
				<br/>

			</div>);
	}});