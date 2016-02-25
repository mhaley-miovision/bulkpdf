TaskGoal = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		ownerPhotos : React.PropTypes.array.isRequired,
		contributorPhotos : React.PropTypes.array.isRequired
	},

	renderTaskState() {
		let label = "Not Started";
		if (this.props.goal.state == 2) {
			label = "Completed";
		} else if (this.props.goal.state == 1) {
			label = "In Progress";
		}
		let classes = "TaskGoalState" + label.replace(" ", "");
		return <div className={classes}>{label}</div>;
	},

	render() {
		return (
			<div className="row">
				<div className="col m10 s8 GoalContainer">
					<div className="TaskGoalTitle">{this.props.goal.name}</div>
				</div>
				<div className="col m2 s2 GoalContainer">
					<div className="TaskGoalSummaryContainer">
						<div className="TaskGoalPhotos">
							<GoalUserPhotoList list={this.props.ownerPhotos}/>
							<GoalUserPhotoList list={this.props.contributorPhotos}/>
						</div>
						<div className="TaskGoalState">
							{this.renderTaskState()}
						</div>
						<GoalDueDateLabel goal={this.props.goal}/>
					</div>
				</div>
			</div>
		);
	},
});