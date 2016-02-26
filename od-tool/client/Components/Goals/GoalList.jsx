GoalList = React.createClass({
	propTypes: {
		goalList: React.PropTypes.array.isRequired
	},

	renderGoals() {
		return this.props.goalList.map(goal => {
			return <Goal
				key={goal._id}
				goal={goal}/>;
		});
	},
	render() {
		return (
			<div>
				{this.renderGoals()}
			</div>
		);
	}
});