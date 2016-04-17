import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Teal from '../../shared/Teal'

/*
	Expects array of items in format: .id, .name
 */

class TabItem extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<li className={"tab col s" + this.props.itemColWidth} id={this.props.id} onClick={this.props.onClick}>
				<a href="#" className={this.props.isActive ? 'active' : ''}>{this.props.name}</a>
			</li>
		);
	}
}
TabItem.propTypes = {
	id: React.PropTypes.string.isRequired,
	name: React.PropTypes.string.isRequired,
	onClick: React.PropTypes.func.isRequired,
	isActive: React.PropTypes.bool.isRequired,
	itemColWidth: React.PropTypes.number.isRequired
};

export default class Tabs extends Component {

	constructor(props) {
		super(props);
		if (props.items.length < 1 || props.items.length > 12) {
			console.error("Must have 1 - 12 items!");
		}
		this.state = { selectedItemId: !!props.selectedItemId ? props.selectedItemId : props.items[0].id };
		this.handleItemClicked = this.handleItemClicked.bind(this);
	}

	handleItemClicked(e) {
		let id = e.currentTarget.id;
		this.props.onClick(id);
		this.setState({selectedItemId:id});
	}

	componentDidMount() {
		$('ul.tabs').tabs();
	}

	renderItems() {
		return this.props.items.map(item => {
			return <TabItem name={item.name} id={item.id} isActive={item.id === this.state.selectedItemId} key={item.id}
							onClick={this.handleItemClicked} itemColWidth={Math.floor(12 / this.props.items.length)}/>
		});
	}

	render() {
		return (
			<div className="row">
				<div className="col s12">
					<ul className="tabs">
						{this.renderItems()}
					</ul>
				</div>
			</div>
		);
	}
}

Tabs.propTypes = {
	spinner : React.PropTypes.bool
};

Tabs.defaultProps = {
	items: React.PropTypes.array.isRequired,
	selectedItemId: React.PropTypes.string,
	onClick: React.PropTypes.func.isRequired
};
