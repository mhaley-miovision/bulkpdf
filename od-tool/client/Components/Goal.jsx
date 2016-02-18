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
		var handle = Meteor.subscribe("goals");

		if (handle.ready()) {
			let children = GoalsCollection.find({parent:this.props.goal._id}).fetch();
			let ownerPhotos = {};
			let photos = ContributorsCollection.find({email: { $in: this.props.goal.owners } }, { fields: {email:1,photo:1}}).fetch();
			photos.forEach(x => {
				if (x.email) {
					ownerPhotos[x.email] = x.photo ? x.photo : "/img/user_avatar_blank.jpg"
				}
			});
			return { children: children, ownerPhotos: ownerPhotos, doneLoading: true }
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
		//Meteor.call("removeGoal", this.props.goal._id);
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
			Meteor.call("renameGoal", this.props.goal._id, this.state.newGoalName, function(err, data) {
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

	renderGoalOwnerList() {
		let _this = this;
		return this.props.goal.owners.map(ownerEmail => {
			// TODO: build route in a more sustainable way (i.e. using Flow router params)
			var photo = this.data.doneLoading && _this.data.ownerPhotos[ownerEmail];
			if (photo)
			{
				let url = FlowRouter.path( "profile", {}, {objectId:ownerEmail} );
				return (
					<a key={ownerEmail} href={url}>
						<img key={ownerEmail} title={ownerEmail} className="right goalItemPhoto" src={photo}/>
					</a>
				);
			} else {
				return (
					<img key={ownerEmail} title={ownerEmail} className="right goalItemPhoto" src="/img/user_avatar_blank.jpg"/>
				);
			}
		});
	},

	renderSubgoalsList() {
		if (this.data.doneLoading) {
			if (this.data.children && this.data.children.length > 0) {
				return (
					<ul className="collapsible" data-collapsible="accordion">
						{this.renderSubgoalsListItems()}
					</ul>
				);
			}
		} else {
			return <Loading />;
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
			var gd = this.props.goal.estimatedCompletedOn ? new Date(this.props.goal.estimatedCompletedOn) : null;
			var complete = this.props.goal.stats && (this.props.goal.stats.inProgress == 0 && this.props.goal.stats.notStarted == 0);
			var overdue = gd && (gd < new Date());

			var classes = "goalDueDate";
			if (overdue && !complete) {
				classes += " late";
			}
			return <span className={classes}>{this.props.goal.estimatedCompletedOn}</span>;
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
					<div className="collapsible-header">
						<div className="row">
							<div className="col m9 s12 goalNameText">
								{this.props.goal.name}
							</div>
							<div className="col m2 s8">
								{this.renderGoalOwnerList()}
							</div>
							<div className="col m1 s4 goalHeaderInformation">
								<SimpleGoalProgressBar goal={this.props.goal}/>
								{this.renderGoalDueDateLabel()}
							</div>
						</div>
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

