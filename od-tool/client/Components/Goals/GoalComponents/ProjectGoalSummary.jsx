ProjectGoalSummary = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired
	},

	render() {
		let subGoalsLabel =
			(this.props.goal.stats.completed + this.props.goal.stats.notStarted + this.props.goal.stats.inProgress)
			+ " Subgoals";
		let subGoalsToolTip =
			"Completed:" + this.props.goal.stats.completed +
			"\nIn Progress: " + this.props.goal.stats.inProgress +
			"\nNot Started: " + this.props.goal.stats.notStarted;
		return (
			<section>
				{ this.props.goal.ownerRoles.length > 0 ?
					<GoalUserPhotoList list={this.props.goal.ownerRoles} heading="Owner"/>
					: ''
				}
				{ this.props.goal.contributorRoles.length > 0 ?
					<GoalUserPhotoList list={this.props.goal.contributorRoles} heading="Contributor"/>
					: ''
				}
				<div className="center GoalStatsSection" data-tip={subGoalsToolTip}>
					<div className="GoalSummaryHeading">{subGoalsLabel}</div>
					<GoalsStatsDonut goal={this.props.goal} width="60px" height="60px" />
					<ReactTooltip place="bottom"/>
				</div>
				{ this.props.goal.estimatedCompletedOn ?
					<div className="center">
						<GoalDueDateLabel goal={this.props.goal}/>
					</div>
					: ''
				}
			</section>
		);
	},
});
