import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class SimpleGoalProgressBar extends Component {
	constructor(props) {
		super(props);
	}

	defaultColorFunction(i) {
		if (i == 0) {
			return "#33cc33";
		} else if (i == 1) {
			return "#ffe166";
		} else if (i == 2) {
			return "#46BFBD";
		}
		return "#888888";
	}

	getBarWidths() {
		if (this.props.goal && this.props.goal.stats) {
			var s = this.props.goal.stats;
			var total = s.completed + s.inProgress + s.notStarted;
			var w = this.props.width - 10;
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
	}

	render() {
		var widths = this.getBarWidths();

		return (
			<div className="simpleProgressChart" style={{"width" : this.props.width, "height" : this.props.height}}>
				<div className="simpleProgressChartBar" style={{
					"width" : widths.completedWidth, "backgroundColor" : "#46BFBD", "height" : this.props.height,
					float:"left", margin: this.props.margin, borderStyle:"solid", borderColor:"#666666", borderWidth:"1px 0 1px 1px"}}></div>
				<div className="simpleProgressChartBar"  style={{
					"width" : widths.inProgressWidth, "backgroundColor" : "#ffe166", "height" : this.props.height,
					float:"left", margin: this.props.margin, borderStyle:"solid", borderColor:"#666666", borderWidth:"1px 0 1px 0"}}></div>
				<div className="simpleProgressChartBar"  style={{
					"width" : widths.notStartedWidth, "backgroundColor" : "#ff6666", "height" : this.props.height,
					float:"left", margin: this.props.margin, borderStyle:"solid", borderColor:"#666666", borderWidth:"1px 1px 1px 0"}}></div>
			</div>
		);
	}
}

SimpleGoalProgressBar.propTypes = {
	goal: React.PropTypes.object.isRequired,
	width: React.PropTypes.number,
	height: React.PropTypes.number
};

SimpleGoalProgressBar.defaultProps = {
	width: 70,
	height: 7,
	margin: "14px 0 0 0"
};