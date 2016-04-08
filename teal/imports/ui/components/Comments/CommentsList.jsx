import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Teal from '../../../shared/Teal'

import CommentsInput from './CommentsInput.jsx'
import CommentItem from './CommentItem.jsx'

export default class CommentsList extends Component {

	//TODO: encapsulation fail
	initialize() {
		 this.refs.commentsInputBox.initialize();
	}

	renderComments() {
		return this.props.comments.map(c => {
			return <CommentItem
				className='CommentItem'
				key={Teal.newId()}
				comment={c}
			/>
		});
	}

	renderInputBox() {
		if (this.props.showAddInput) {
			return <CommentsInput key={Teal.newId()} ref="commentsInputBox"
								  objectId={this.props.objectId} objectType={this.props.objectType} />
		}
	}

	render() {
		return (
			<div className="Comments">
				{this.renderInputBox()}
				<div className='CommentsList' style={{ margin: 0 }} key={Teal.newId()}>
					{this.renderComments()}
				</div>
			</div>
		);
	}
}

CommentsList.propTypes = {
	comments: React.PropTypes.array.isRequired,
		showAddInput: React.PropTypes.bool.isRequired,
		objectId: React.PropTypes.string.isRequired,
		objectType: React.PropTypes.string.isRequired,
};
