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
			let ownerPhotos = this.props.goal.owners ?
				ContributorsCollection.find({email: { $in: this.props.goal.owners } }, { fields: {email:1,photo:1}}).fetch()
				: [];
			let contributorPhotos = this.props.goal.contributors ?
				ContributorsCollection.find({email: { $in: this.props.goal.contributors } }, { fields: {email:1,photo:1}}).fetch()
				: [];

			return { ownerPhotos: ownerPhotos, contributorPhotos:contributorPhotos, doneLoading: true }
		} else {
			return { doneLoading: false }
		}
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
		if (this.props.goal.path.length == 0) {
			// this is a root level goal
			return this.renderRootLevelGoal();
		} else if (!this.props.goal.isLeaf) {
			// this is a project goal
			return <ProjectGoal goal={this.props.goal}
								ownerPhotos={this.data.ownerPhotos}
								contributorPhotos={this.data.contributorPhotos}/>;
		} else {
			return <TaskGoal goal={this.props.goal}
								ownerPhotos={this.data.ownerPhotos}
								contributorPhotos={this.data.contributorPhotos}/>;
		}
	},

	handleOnClick(e) {

	},

	render() {
		return (
			<div className="card hoverable" style={{marginBottom:"40px"}}>
				{this.data.doneLoading ? this.renderGoalBody() : <Loading spinner={true}/>}
				<GoalControls goal={this.props.goal}/>
			</div>
		);
	}
});

