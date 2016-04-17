import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import Goal from './Goal.jsx'

export default class GoalList extends Component {

	renderGoals() {
		if (this.props.goalList.length > 0) {
			return this.props.goalList.map(goal => {
				return <Goal
					key={goal._id}
					goal={goal}
					compactViewMode={this.props.compactViewMode}
					onGoalClicked={this.props.onGoalClicked}/>;
			});
		} else {
			return (
				<div className="row centeredCard">
					<div className="col s12 m6 offset-m3">
						<div className="card blue-grey darken-1">
							<div className="card-content white-text center">
								<span className="card-title">No goals defined yet</span>
								<p>To fix this, assign roles filled by these contributors to existing goals.</p>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}
	render() {
		return (
			<div className={ this.props.compactViewMode ? 'collection GoalList' : ' GoalList' } style={{ margin: 0 }}>
				{this.renderGoals()}
			</div>
		);
	}
}

GoalList.propTypes = {
	goalList: React.PropTypes.array.isRequired,
	compactViewMode: React.PropTypes.bool,
	onGoalClicked: React.PropTypes.func
};
