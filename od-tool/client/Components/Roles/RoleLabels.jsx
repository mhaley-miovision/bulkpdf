RoleLabels = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	// Loads items from the Tasks collection and puts them on this.data.tasks
	getMeteorData() {
		var handle = Meteor.subscribe("teal.role_labels");
		if (handle.ready()) {
			var roleLabels = RoleLabelsCollection.find({}, {sort: {name: 1}}).fetch();
			return {
				roleLabels: roleLabels,
				currentUser: Meteor.user(),
				doneLoading:true,
			};
		} else {
			return { doneLoading:false };
		}
	},

	getInitialState() {
		return {
		}
	},

	renderRoleLabels() {
		return this.data.roleLabels.map((roleLabel) => {
			const currentUserId = this.data.currentUser && this.data.currentUser.profile._id;

			return <RoleLabel
				key={roleLabel._id}
				roleLabel={roleLabel} />;
		});
	},

	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

		let changeObject = Teal.createChangeObject(Teal.ChangeTypes.NewRoleLabel, Teal.ObjectTypes.RoleLabel,
			"teal.roles.addRoleLabel", [ this.props.roleLabel._id, this.state.newLabel ]);
		Meteor.call("teal.changes.create", changeObject, Teal.notifyChangeResult);

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	},

	renderBody() {
		if (this.data.doneLoading) {
			return (
				<ul className="collection">
					{this.renderRoleLabels()}
				</ul>
			);
		} else {
			return <Loading />
		}
	},

	render() {
		return (
		<div className="container">
			<header>
				<h3 className="center header text-main1">Role Labels</h3>
			</header>

			{
				this.data.currentUser ?
				<form className="new-task" onSubmit={this.handleSubmit} >
					<input
						type="text"
						ref="textInput"
						placeholder="Type to add new role labels" />
				</form> : ''
			}

			{this.renderBody()}

			<br/>
			<br/>

		</div>);
}});