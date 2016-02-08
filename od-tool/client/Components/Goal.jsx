// Role component - represents a single role
Goal = React.createClass({
	propTypes: {
		// This component gets the task to display through a React prop.
		// We can use propTypes to indicate it is required
		goal: React.PropTypes.object.isRequired
	},

	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	// Loads items from the Goals collection and puts them on this.data.goals
	getMeteorData() {
		var handle = Meteor.subscribe("contributors");
		var handle2 = Meteor.subscribe("users");
		var isLoading = !(handle.ready() && handle2.ready());
		var ownerPhotos = [];

		var handle3 = Meteor.subscribe("loadGoalTree");


		if (!isLoading) {
			//console.log(this.props.goal);
			var goalTree = Meteor.call("loadGoalTree", function(error, data) {
				console.log(data);
			});
			// populate photo urls
			for (var i = 0; i < this.props.goal.owners.length; i++) {
				// TODO: make this more optimal
				var email = this.props.goal.owners[i];
				var c = ContributorsCollection.findOne({email: email});
				var url = (c && c.photo) ? c.photo : "img/user_avatar_blank.jpg";
				ownerPhotos[email] = url;
			}
		}
		return {
			isLoading: isLoading,
			ownerPhotos: ownerPhotos,
			currentUser: Meteor.user()
		};
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
			});
		}
	},

	handleOnBlur() {
		this.setState({isEditing:false});
	},

	handleOnEdit() {
		this.setState({isEditing:true});
	},

	handleOnChange() {
		this.state.newLabel = this.refs.newLabel.value;
	},

	renderGoalOwnerList() {
		if (!this.data.isLoading) {
			return this.props.goal.owners.map(owner => {
				// TODO: build route in a more sustainable way (i.e. using Flow router params)
				return (
					<a href={"/organization?objectName=" + owner.email + "&objectType=contributor&mode=acc"}>
						<img key={owner.email} title={owner.email} className="right goalItemPhoto" src={owner.photo}/>
					</a>
				);
			});
		}
	},

	renderSubgoalsList() {
		if (this.props.goal.children && this.props.goal.children.length > 1) {
			return (
				<div style={{"padding":"25px"}}>
					<ul className="collapsible" data-collapsible="accordion">
						{this.renderSubgoalsListItems()}
					</ul>
				</div>
			);
		} else {
			return (
				<div className="grey-text" style={{"padding":"25px"}}>
					This goal has no sub-goals yet.
					<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text">add</i></div>
			);
		}
	},

	componentDidMount() {
		$('.tooltipped').tooltip({delay: 50});
	},

	renderSubgoalsListItems() {
		return (this.props.goal.children.map(goal => {
			return <Goal
				key={goal._id}
				goal={goal}/>;
		}));
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
							<div className="col m9 goalNameText">
								{this.props.goal.name}
							</div>
							<div className="col m2">
								{this.renderGoalOwnerList()}
							</div>
							<div className="col m1">
								<SimpleGoalProgressBar goal={this.props.goal}/>
								{this.renderGoalDueDateLabel()}
							</div>
						</div>

					</div>
					<div className="collapsible-body">
						{this.renderSubgoalsList()}
					</div>
				</li>
			);
		}

		/*
		if (false) {


		 <div style={{display:"inline-block", width:"60%", lineHeight:"1.5em", marginTop:"10px"}}>
		 {this.props.goal.name}
		 </div>




		 <div className="right">
		 <SimpleGoalProgressBar goal={this.props.goal}/>
		 </div>


		 <div className="right">
		 {this.renderGoalOwnerList()}
		 </div>



		 </div>
		 <div className="collapsible-body">
		 {this.renderSubgoalsList()}
		 </div>


			<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
			   onClick={this.handleOnEdit}>edit</i>

			<i className="waves-effect waves-teal listItemIcon tiny material-icons right grey-text"
			onClick={this.deleteThisRoleLabel}>delete</i>

		 <i className="listItemIcon tiny material-icons right grey-text"
		 onClick={this.handleOnEdit}>thumb_up</i>

		 <i className="listItemIcon tiny material-icons right grey-text"
		 onClick={this.deleteThisRoleLabel}>thumb_down</i>
		}*/
	}
});

