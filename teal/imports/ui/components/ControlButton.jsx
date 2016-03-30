import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

class ControlIconButton extends Component {

	renderCountBadge() {
		if (!!this.props.countBadgeValue) {
			return <div className="CountBadge">{this.props.countBadgeValue}</div>;
		}
	}

	render() {
		return (
			<div className={"ControlButton GreyButton" + (this.props.small ? 'Small' : '')}
				 data-tip={this.props.tip} data-for={this.props.tipId}>
				<i className="material-icons" onClick={this.props.onClicked}>{this.props.icon}</i>
				{this.renderCountBadge()}
			</div>
		);
	}
}

ControlIconButton.propTypes = {
	onClicked: React.PropTypes.func.isRequired,
		icon: React.PropTypes.string.isRequired,
		tip: React.PropTypes.string,
		tipId: React.PropTypes.string,
		countBadgeValue: React.PropTypes.number,
		small: React.PropTypes.bool,
};
