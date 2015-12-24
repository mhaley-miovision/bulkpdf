RoleLabelsComponent = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	// Loads items from the Tasks collection and puts them on this.data.tasks
	getMeteorData() {
		var roleLabels = RoleLabelsCollection.find({}, {sort: {name:1}}).fetch();
		return {
			roleLabels: roleLabels,
			currentUser: Meteor.user()
		};
	},

	getInitialState() {
		return {
		}
	},

	renderRoleLabels() {
		return this.data.roleLabels.map((roleLabel) => {
			const currentUserId = this.data.currentUser && this.data.currentUser.profile._id;

			return <RoleLabelComponent
				key={roleLabel._id}
				roleLabel={roleLabel} />;
		});
	},

	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		Meteor.call("addRoleLabel", text, function(err, data) {
			if (err && err.error == "duplicate") {
				Materialize.toast("That label already exists, item was not added.", 3000);
			}
		});

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	},

	render() {
		return (
		<div className="container">
			<br/>

			<header>
				<h3 className="center header text-main1">Edit Role Labels</h3>
			</header>

			{ this.data.currentUser ?
				<form className="new-task" onSubmit={this.handleSubmit} >
					<input
						type="text"
						ref="textInput"
						placeholder="Type to add new role labels" />
				</form> : ''
			}

			<ul className="collection">
					{this.renderRoleLabels()}
			</ul>

			<br/>
			<br/>

		</div>);
}});