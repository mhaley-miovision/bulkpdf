ProjectGoalSummary = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired
	},

	render() {
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
				<div className="center GoalStatsSection">
					<div className="GoalSummaryHeading">Subgoals</div>
					<GoalsStatsDonut goal={this.props.goal} width="60px" height="60px" />
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
