ProjectGoalSummary = React.createClass({
	propTypes: {
		goal : React.PropTypes.object.isRequired,
		ownerPhotos : React.PropTypes.array.isRequired,
		contributorPhotos : React.PropTypes.array.isRequired
	},

	render() {
		return (
			<section>
				<GoalUserPhotoList list={this.props.ownerPhotos} heading="Owner" />
				{ this.props.contributorPhotos.length > 0 ?
					<GoalUserPhotoList list={this.props.contributorPhotos} heading="Contributor"/>
					: ''
				}
				<div className="center GoalStatsSection">
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
