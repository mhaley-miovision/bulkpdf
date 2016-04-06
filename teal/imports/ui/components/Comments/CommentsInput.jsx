import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Teal from '../../../shared/Teal'

import { ContributorsCollection } from '../../../api/contributors'

import { MentionsInput, Mention } from 'react-mentions'

import mentionsStyle from './mentionsStyle'

// use first/outer capture group to extract the full entered sequence to be replaced
// and second/inner capture group to extract search string from the match
const emailRegex = /(([^\s@]+@[^\s@]+\.[^\s@]+))$/;

export default class CommentsInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value:'',
			plainTextValue:'',
			atMentions:[]
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleAddMention = this.handleAddMention.bind(this);
		this.handleCommentSave = this.handleCommentSave.bind(this);
		this.handleRemoveMention = this.handleRemoveMention.bind(this);
		this.transformDisplay = this.transformDisplay.bind(this);
	}

	handleCommentSave() {
		if (this.state.plainTextValue && this.state.plainTextValue !== '') {
			let text = this.state.plainTextValue;
			let mentions = this.state.atMentions.map(m => { return m.id; })
			console.log(text);
			console.log(mentions);

			Meteor.call("teal.comments.addComment", this.props.objectId, this.props.objectType, text, mentions);
			this.initialize();
		}
	}

	initialize() {

	}
	focusOnInput() {

	}

	transformDisplay(id, display, type) {
		return '@'+display;
	}

	handleAddMention(id, display) {
		console.log("Added mention of " + id);
	}
	handleRemoveMention() {
		console.log("removed a mention", arguments);
	}
	handleChange(ev, value, newPlainTextValue, mentions) {
		console.log(mentions);
		this.setState({
			value: value,
			plainTextValue: newPlainTextValue,
			atMentions: mentions
		});
	}
	requestName(query) {
		if (query !== '' && query.length >= 2) {
			var caseInsensitiveMatch = {$regex: new RegExp('.*' + query + '.*', "i")};
			let contributors = ContributorsCollection.find(
				{rootOrgId:Teal.rootOrgId(), name: caseInsensitiveMatch},
				{fields: {name:1,email:1,_id:1}}
			).fetch().map(c => { return { id: c.email, display: c.name } });
			return contributors;
		}
	}
	render() {
		return (
			<div>
				<MentionsInput value={this.state.value}
							   onChange={this.handleChange}
							   style={ mentionsStyle() }
							   displayTransform={this.transformDisplay}
							   placeholder={"Enter your comment and mention people using '@'"}>
					<Mention
							 trigger="@"
							 data={this.requestName}
							 onAdd={this.handleAddMention}
							 style={{backgroundColor: "#cee4e5"}}/>
				</MentionsInput>
				<a className={"waves-effect waves-light btn" + (this.state.value.trim() != '' ? '' : ' disabled')}
				   style={{width: "100px", float:"right", fontSize:"12px", marginTop:"10px", height:"30px", lineHeight:"30px"}}
				   onClick={this.handleCommentSave}>Send</a>
			</div>
		);
	}
}

CommentsInput.propTypes = {
	objectId: React.PropTypes.string.isRequired,
		objectType: React.PropTypes.string.isRequired
};
