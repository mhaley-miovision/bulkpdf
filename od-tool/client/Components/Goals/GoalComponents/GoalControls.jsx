GoalControls = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		hasChildren: React.PropTypes.bool.isRequired
	},

	handleDelete()  {
		// this needs to be done smart
		//Meteor.call("teal.goals.removeGoal", this.props.goal._id);
		Materialize.toast("Functionality not implemented yet, stay tuned!", TOAST_DURATION);
	},

	handleThumbsUp() {
		Materialize.toast("Functionality not implemented yet, stay tuned!", TOAST_DURATION);
	},

	handleThumbsDown() {
		Materialize.toast("Functionality not implemented yet, stay tuned!", TOAST_DURATION);
	},

	handleSubmit(event) {
		event.preventDefault();
		this.setState({isEditing:false});
		if (this.state.newGoalName != '') {
			Meteor.call("teal.goals.renameGoal", this.props.goal._id, this.state.newGoalName, function(err, data) {
			});
		}
	},

	handleOnBlur() {
		this.setState({isEditing:false});
	},

	handleOnEdit() {
		Materialize.toast("Functionality not implemented yet, stay tuned!", TOAST_DURATION);
		//this.setState({isEditing:true});
	},

	handleOnChange() {
		this.state.newLabel = this.refs.newLabel.value;
	},

	handleOnMessage() {
		Materialize.toast("Functionality not implemented yet, stay tuned!", TOAST_DURATION);
	},

	renderGoalStateControls() {
		if (!this.props.hasChildren) {
			return <GoalStateControls goal={this.props.goal}/>
		}
	},

	render() {
		// check here if the user can edit
		let nosubGoalsText = this.props.hasChildren ? "" : "This goal has no sub-goals yet.";

		return (
			<div className="row">
				<div className="col s12 m12 goalControls">
					<span className="grey-text left noSubGoalsText">{nosubGoalsText}</span>

					<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
					   onClick={this.handleOnMessage}>message</i>

					<span className="verticalToolbarDivider"/>

					<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
					   onClick={this.handleOnEdit}>edit</i>

					<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
					   onClick={this.handleDelete}>delete</i>

					<span className="verticalToolbarDivider"/>

					<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
					   onClick={this.handleThumbsUp}>thumb_up</i>

					<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
					   onClick={this.handleThumbsDown}>thumb_down</i>

					{this.renderGoalStateControls()}
				</div>
			</div>
		);
	},
});