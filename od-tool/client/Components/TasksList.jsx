TaskListComponent = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	// Loads items from the Tasks collection and puts them on this.data.tasks
	getMeteorData() {
		let query = {};

		if (this.state.hideCompleted) {
			// If hide completed is checked, filter tasks
			query = {checked: {$ne: true}};
		}

		return {
			tasks: TasksCollection.find(query, {sort: {createdAt: -1}}).fetch(),
			incompleteCount: TasksCollection.find({checked: {$ne: true}}).count(),
			currentUser: Meteor.user()
		};
	},

	getInitialState() {
		return {
			hideCompleted: false
		}
	},

	renderTasks() {
		// Get tasks from this.data.tasks
		return this.data.tasks.map((task) => {
			const currentUserId = this.data.currentUser && this.data.currentUser.profile._id;
			const showPrivateButton = task.owner === currentUserId;

			console.log(task.owner);
			console.log(this.data.currentUser.profile);

			return <TaskComponent
				key={task._id}
				task={task}
				showPrivateButton={showPrivateButton}/>;
		});
	},

	handleSubmit(event) {
		event.preventDefault();

		// Find the text field via the React ref
		var text = React.findDOMNode(this.refs.textInput).value.trim();

		Meteor.call("addTask", text);

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	},

	toggleHideCompleted() {
		this.setState({
			hideCompleted: !this.state.hideCompleted
		});
	},

	render() {
		return (
		<div>
			<header>
				<h3 className="center header">My Task List ({this.data.incompleteCount})</h3>
			</header>

			<label className="btn-small">
				<input
					type="checkbox"
					readOnly={true}
					checked={this.state.hideCompleted}
					onClick={this.toggleHideCompleted} />
				Hide Completed Tasks
			</label>

			{ this.data.currentUser ?
				<form className="new-task" onSubmit={this.handleSubmit} >
					<input
						type="text"
						ref="textInput"
						placeholder="Type to add new tasks" />
				</form> : ''
			}

			<ul className="collection">
				{this.renderTasks()}
			</ul>
		</div>
)}});