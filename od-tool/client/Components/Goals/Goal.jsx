const TOAST_DURATION = 1000;

// Role component - represents a single role
Goal = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	propTypes: {
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

			return { children: children, ownerPhotos: ownerPhotos,
				contributorPhotos:contributorPhotos, doneLoading: true,
				hasChildren: children && children.length > 0 }
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

	renderGoalBody() {
		if (this.data.doneLoading) {
			if (this.props.goal.path.length == 0) {
				// this is a root level goal
				return this.renderRootLevelGoal();
			} else if (this.data.hasChildren) {
				// this is a project goal
				return <ProjectGoal goal={this.props.goal}
									ownerPhotos={this.data.ownerPhotos}
									contributorPhotos={this.data.contributorPhotos}/>;
			} else {
				return <TaskGoal goal={this.props.goal}
									ownerPhotos={this.data.ownerPhotos}
									contributorPhotos={this.data.contributorPhotos}/>;
			}
		} else {
			return <Loading spinner={true}/>;
		}
	},

	handleOnClick(e) {
		console.log("EEEE");
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<li>
					<div className="collapsible-header" onClick={this.handleOnClick}>
						{this.renderGoalBody()}
					</div>
					<div className="collapsible-body">
						<div style={{"padding":"25px"}}>
							<GoalControls goal={this.props.goal} hasChildren={this.data.hasChildren}/>
							{this.renderComments()}
							{this.renderSubgoalsList()}
						</div>
					</div>
				</li>
			);
		} else {
			return <Loading spinner={true}/>
		}

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
		}
	}
});

