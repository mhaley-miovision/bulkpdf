SimpleGoalProgressBar = React.createClass({
	propTypes: {
		goal: React.PropTypes.object.isRequired,
		width: React.PropTypes.number,
		height: React.PropTypes.number,
	},
	getDefaultProps() {
		return {
			width: 60,
			height: 7,
		};
	},

	defaultColorFunction: function(i) {
		if (i == 0) {
			return "#33cc33";
		} else if (i == 1) {
			return "#ffe166";
		} else if (i == 2) {
			return "#ff6666";
		}
		return "#888888";
	},

	getBarWidths() {
		if (this.props.goal && this.props.goal.stats) {
			var s = this.props.goal.stats;
			var total = s.completed + s.inProgress + s.notStarted;
			var w = this.props.width-10;
			return {
				completedWidth: Math.round(w * s.completed / total) + "px",
				inProgressWidth: Math.round(w * s.inProgress / total) + "px",
				notStartedWidth: Math.round(w * s.notStarted / total) + "px",
			}
		} else {
			return {
				completedWidth: 0,
				inProgressWidth: 0,
				notStartedWidth: 0,
			}
		}
	},

	render() {
		var widths = this.getBarWidths();

		return (
			<div className="simpleProgressChart" style={{"width" : this.props.width, "height" : this.props.height}}>
				<div className="simpleProgressChartBar" style={{"width" : widths.completedWidth, "backgroundColor" : "#33cc33", "height" : this.props.height, float:"left", margin:"15px 0 0 0"}}></div>
				<div className="simpleProgressChartBar"  style={{"width" : widths.inProgressWidth, "backgroundColor" : "#ffe166", "height" : this.props.height, float:"left", margin:"15px 0 0 0"}}></div>
				<div className="simpleProgressChartBar"  style={{"width" : widths.notStartedWidth, "backgroundColor" : "#ff6666", "height" : this.props.height, float:"left", margin:"15px 0 0 0",}}></div>
			</div>
		);
	},
});
