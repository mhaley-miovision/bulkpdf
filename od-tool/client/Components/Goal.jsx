// Role component - represents a single role
Goal = React.createClass({
	propTypes: {
		// This component gets the task to display through a React prop.
		// We can use propTypes to indicate it is required
		goal: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			isEditing: false,
			newGoalName: this.props.goal.name,
		};
	},

	deleteThisGoal() {
		Meteor.call("removeGoal", this.props.goal._id);
	},

	handleSubmit(event) {
		event.preventDefault();
		this.setState({isEditing:false});
		if (this.state.newGoalName != '') {
			Meteor.call("renameGoal", this.props.goal._id, this.state.newGoalName, function(err, data) {

				/*
				if (err && err.error == "duplicate") {
					Materialize.toast("That label already exists, change was not applied.", 3000);
				}*/
			});
		}
	},

	handleOnBlur() {
		this.setState({isEditing:false});
	},

	handleOnEdit() {
		this.setState({isEditing:true});
	},

	handleOnEdit() {
		this.setState({isEditing:true});
	},

	handleOnEdit() {
		this.setState({isEditing:true});
	},

	handleOnChange() {
		this.state.newLabel = this.refs.newLabel.value;
	},

	render() {
		if (this.state.isEditing) {
			return (
				<li className="collection-item">
					<form onSubmit={this.handleSubmit}>
						<input placeholder="Enter a new label"
							   type="text"
							   className="validate"
							   autoFocus
							   onBlur={this.handleOnBlur}
							   ref="newLabel"
							   onChange={this.handleOnChange}
						/>
					</form>
				</li>
			);
		} else {
			return (
				<li className="collection-item">
					{this.props.goal.name}
					<i className="waves-effect waves-teal itemEditingIcons tiny material-icons right grey-text" onClick={this.handleOnEdit}>edit</i>
					<i className="waves-effect waves-teal itemEditingIcons tiny material-icons right grey-text" onClick={this.deleteThisRoleLabel}>delete</i>
				</li>
			);
		}
	}
});

