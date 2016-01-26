GoalList = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	// Loads items from the Goals collection and puts them on this.data.goals
	getMeteorData() {
		var goals = GoalsCollection.find({}).fetch();
		return {
			goals: goals,
			currentUser: Meteor.user()
		};
	},

	getInitialState() {
		return {
		}
	},

	renderGoals() {
		return this.data.goals.map((goal) => {
			const currentUserId = this.data.currentUser && this.data.currentUser.profile._id;

			return <Goal
				key={goal._id}
				goal={goal} />;
		});
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

				{ this.data.currentUser ?
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