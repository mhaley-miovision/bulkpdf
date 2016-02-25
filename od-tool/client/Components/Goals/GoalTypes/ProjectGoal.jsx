ProjectGoal = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		ownerPhotos : React.PropTypes.array.isRequired,
		contributorPhotos : React.PropTypes.array.isRequired
	},

	render() {
		return (
			<div>
				<div className="row">
					<div className="col m9 s12 GoalContainer">
						<div className="">
							<span className="ProjectGoalTitle">{this.props.goal.name}</span>
							<span className="ProjectTag">{this.props.goal.rootGoalName}</span>
						</div>
						<GoalDoneCriteria goal={this.props.goal}/>
						<GoalKeyObjectives goal={this.props.goal}/>
					</div>
					<div className="col m3 s8 GoalContainer">
						<ProjectGoalSummary goal={this.props.goal}
											ownerPhotos={this.props.ownerPhotos}
											contributorPhotos={this.props.contributorPhotos}/>
					</div>
				</div>
			</div>
		);
	},
});