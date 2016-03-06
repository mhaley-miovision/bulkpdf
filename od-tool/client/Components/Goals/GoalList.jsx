GoalList = React.createClass({
	propTypes: {
		goalList: React.PropTypes.array.isRequired,
		compactViewMode: React.PropTypes.bool,
		onGoalClicked: React.PropTypes.any,
	},

	renderGoals() {
		return this.props.goalList.map(goal => {
			return <Goal
				key={goal._id}
				goal={goal}
				compactViewMode={this.props.compactViewMode}
				onGoalClicked={this.props.onGoalClicked}/>;
		});
	},
	render() {
		return (
			<div className={ this.props.compactViewMode ? 'collection GoalList' : ' GoalList' } style={{ margin: 0 }}>
				{this.renderGoals()}
			</div>
		);
	}
});