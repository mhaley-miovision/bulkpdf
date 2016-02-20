// Task component - represents a single todo item
Task = React.createClass({
	propTypes: {
		// This component gets the task to display through a React prop.
		// We can use propTypes to indicate it is required
		task: React.PropTypes.object.isRequired,
		showPrivateButton: React.PropTypes.bool.isRequired
	},

	toggleChecked() {
		// Set the checked property to the opposite of its current value
		Meteor.call("teal.tasks.setChecked", this.props.task._id, !this.props.task.checked);
	},

	deleteThisTask() {
		Meteor.call("teal.tasks.removeTask", this.props.task._id);
	},

	togglePrivate() {
		Meteor.call("teal.tasks.setPrivate", this.props.task._id, ! this.props.task.private);
	},

	render() {
		// Give tasks a different className when they are checked off,
		// so that we can style them nicely in CSS
		const taskClassName = (this.props.task.checked ? "checked" : "") + " collection-item " +
			(this.props.task.private ? "private" : "");

		return (
			<li className={taskClassName}>
				<a className="waves-effect waves-teal btn-flat delete" onClick={this.deleteThisTask}>
					<i className="material-icons delete">delete</i>
				</a>

				{ this.props.showPrivateButton ? (
					<a className="waves-effect waves-teal btn-flat delete" onClick={this.togglePrivate}>
						{ this.props.task.private ? "Private" : "Public" }
					</a>
				) : ''}

				<input
					type="checkbox"
					onClick={this.toggleChecked}
					readOnly={true}
					checked={this.props.task.checked}
					id={this.props.task._id}/>
				<label htmlFor={this.props.task._id}>{this.props.task.username} - {this.props.task.text}</label>

			</li>
		);
	}
});

