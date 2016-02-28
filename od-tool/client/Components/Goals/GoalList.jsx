GoalList = React.createClass({
	propTypes: {
		goalList: React.PropTypes.array.isRequired,
		compactViewMode: React.PropTypes.bool,
	},

	renderGoals() {
		return this.props.goalList.map(goal => {
			return <Goal
				key={goal._id}
				goal={goal}
				compactViewMode={this.props.compactViewMode}/>;
		});
	},
	render() {
		return (
			<div className={this.props.compactViewMode ? 'collection' : ''} style={{ margin: 0 }}>
				{this.renderGoals()}
			</div>
		);
	}
});