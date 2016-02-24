const TOAST_DURATION = 1000;

// Role component - represents a single role
Goal = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	propTypes: {
		// This component gets the goal to display through a React prop.
		// We can use propTypes to indicate it is required
		goal: React.PropTypes.object.isRequired
	},

	getMeteorData() {
		var handle = Meteor.subscribe("teal.goals");

		if (handle.ready()) {
			// TODO: don't retrieve this in the future
			let children = GoalsCollection.find({parent:this.props.goal._id}).fetch();

			let ownerPhotos = this.props.goal.owners ?
				ContributorsCollection.find({email: { $in: this.props.goal.owners } }, { fields: {email:1,photo:1}}).fetch()
				: [];
			let contributorPhotos = this.props.goal.contributors ?
				ContributorsCollection.find({email: { $in: this.props.goal.contributors } }, { fields: {email:1,photo:1}}).fetch()
				: [];

			return { children: children, ownerPhotos: ownerPhotos, contributorPhotos:contributorPhotos, doneLoading: true }
		} else {
			return { doneLoading: false }
		}
	},

	getInitialState() {
		return {
			isEditing: false,
			newGoalName: this.props.goal.name,
		};
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

	renderUserPhotoList(list, heading) {
		if (list.length == 0) return ''; // don't render anything

		let objects = [];
		list.forEach(item => {
			let email = item.email;
			let photoUrl = item.photo;
			let url = FlowRouter.path( "profile", {}, {objectId:email} );
			if (photoUrl) {
				objects.push(
					<a key={email} href={url}>
						<img key={email} title={email} className="goalItemPhoto" src={photoUrl}/>
					</a>
				);
			} else {
				objects.push(
					<a key={email} href={url}>
						<img key={email} title={email} className="goalItemPhoto" src="/img/user_avatar_blank.jpg"/>
					</a>
				);
			}
		});

		let rootObjects = [];
		if (heading) {
			rootObjects.push(<div className="GoalOwnersHeading">{heading + (list.length > 1 ? "s" : "")}</div>);
		}
		rootObjects.push(<div className="GoalOwnerPhotos center">{objects}</div>);
		return <div className="GoalOwnersSection">{rootObjects}</div>;
	},

	renderSubgoalsList() {
		if (this.data.doneLoading) {
			if (!this.props.goal.isLeaf) {
				return (
					<ul className="collapsible" data-collapsible="accordion">
						{this.renderSubgoalsListItems()}
					</ul>
				);
			}
		} else {
			return <Loading spinner={true}/>;
		}
	},

	componentDidMount() {
		$(document).ready(function(){
			$('.collapsible').collapsible({
				accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
			});
		});
	},

	renderSubgoalsListItems() {
		if (this.data.doneLoading) {
			return (this.data.children.map(goal => {
				return <Goal
					key={goal._id}
					goal={goal}/>;
			}));
		} else {
			return <Loading />
		}
	},

	renderGoalDueDateLabel() {
		if (this.props.goal.estimatedCompletedOn) {
			var gd = this.props.goal.estimatedCompletedOn;// ? new Date(this.props.goal.estimatedCompletedOn) : null;
			var complete = this.props.goal.stats && (this.props.goal.stats.inProgress == 0 && this.props.goal.stats.notStarted == 0);
			var overdue = gd && (gd < new Date());

			var classes = "GoalDueDate";
			if (overdue && !complete) {
				classes += " late";
			}
			return <span className={classes}>{moment(this.props.goal.estimatedCompletedOn).format("MMM Do")}</span>;
		}
	},

	renderGoalStateControls() {
		if (!this.hasChildren()) {
			return <GoalStateControls goal={this.props.goal}/>
		}
	},

	hasChildren() {
		return (this.data.children && this.data.children.length > 0);
	},

	renderGoalControls() {

		// check here if the user can edit
		let nosubGoalsText = this.hasChildren() ? "" : "This goal has no sub-goals yet.";

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

	renderComments() {
		return;
		return (
			<div className="commentsBox-wrapper">
				<textarea className="commentsBox" tabIndex="0" />
			</div>
		);
	},

	renderRootLevelGoal() {
		return (
			<div className="row">
				<div className="col m9 s12 GoalContainer">
					<div className="RootGoalTitle">{this.props.goal.name}</div>
				</div>
			</div>
		);
	},

	renderKeyObjectives() {
		if (this.props.goal.keyObjectives.length > 0) {
			return this.props.goal.keyObjectives.map(function(o,i) {
				return (
					<li className="ProjectGoalKeyObjective">
						<input id={o+"-ko"+i} type="checkbox"/>
						<label htmlFor={o+"-ko"+i}>{o}</label>
					</li>
				);
			});
		} else {
			return 'No key objectives defined yet.';
		}
	},

	renderDoneCriteria() {
		if (this.props.goal.doneCriteria.length > 0) {
			return this.props.goal.doneCriteria.map(function(o,i) {
				return (
					<li className="ProjectGoalKeyObjective">
						<input id={o+"-dc"+i} type="checkbox"/>
						<label htmlFor={o+"-dc"+i}>{o}</label>
					</li>
				);
			});
		} else {
			return 'No done criteria defined yet.';
		}
	},

	renderProjectSummaryDetails() {
		if (this.data.doneLoading) {
			let objects = [];
			objects.push(this.renderUserPhotoList(this.data.ownerPhotos, "Owner"));
			objects.push(this.renderUserPhotoList(this.data.contributorPhotos, "Contributor"));
			objects.push(
				<div className="center GoalStatsSection">
					<GoalsStatsDonut goal={this.props.goal} width="60px" height="60px" />
				</div>
			);
			objects.push(
				<div className="center">
					{this.renderGoalDueDateLabel()}
				</div>
			);
			return objects;
		} else {
			return <Loading spinner={true}/>
		}
	},

	renderProjectGoal() {
		return (
			<div>
				<div className="row">
					<div className="col m9 s12 GoalContainer">
						<div className="">
							<span className="ProjectGoalTitle">{this.props.goal.name}</span>
							<span className="ProjectTag">{this.props.goal.rootGoalName}</span>
						</div>

						<div className="ProjectGoalSubtitle">What Done Looks Like</div>
						<ul className="ProjectGoalDoneCriteria">
							{this.renderDoneCriteria()}
						</ul>
						<div className="ProjectGoalSubtitle">Key Objectives</div>
						<ul className="ProjectGoalDoneCriteria">
							{this.renderKeyObjectives()}
						</ul>
					</div>
					<div className="col m3 s8 GoalContainer">
						{this.renderProjectSummaryDetails()}
					</div>
				</div>
			</div>
		);
	},

	renderTaskGoalPhotos() {
		if (this.data.doneLoading) {
			var objects = [];
			objects.push(this.renderUserPhotoList(this.data.ownerPhotos));
			objects.push(this.renderUserPhotoList(this.data.contributorPhotos));
			return objects;
		} else {
			return <Loading spinner={true}/>
		}
	},

	renderTaskState() {
		//TODO: fix this garbage
		let state = "NotStarted";
		let label = "Not Started";
		if (this.props.goal.state == 2) {
			state = "Completed";
			label = "Completed";
		} else if (this.props.goal.state == 1) {
			state = "InProgress";
			label = "In Progress";
		}
		let classes = "TaskGoalState" + state;
		return <div className={classes}>{label}</div>;
	},

	renderTaskGoal() {
		return (
			<div className="row">
				<div className="col m10 s8 GoalContainer">
					<div className="TaskGoalTitle">{this.props.goal.name}</div>
				</div>
				<div className="col m2 s2 GoalContainer">
					<div className="TaskGoalSummaryContainer">
						<div className="TaskGoalPhotos">
							{this.renderTaskGoalPhotos()}
						</div>
						<div className="TaskGoalState">
							{this.renderTaskState()}
						</div>
						{this.renderGoalDueDateLabel()}
					</div>

				</div>
			</div>
		);
	},

	renderGoalBody() {
		if (this.props.goal.path.length == 0) {
			// this is a root level goal
			return this.renderRootLevelGoal();
		} else if (this.hasChildren()) {
			// this is a project goal
			return this.renderProjectGoal();
		} else {
			return this.renderTaskGoal();
		}
	},

	handleOnClick(e) {
		console.log("EEEE");
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
				<li>
					<div className="collapsible-header" onClick={this.handleOnClick}>
						{this.renderGoalBody()}
					</div>
					<div className="collapsible-body">
						<div style={{"padding":"25px"}}>
							{this.renderGoalControls()}
							{this.renderComments()}
							{this.renderSubgoalsList()}
						</div>
					</div>
				</li>
			);
		}
	}
});

