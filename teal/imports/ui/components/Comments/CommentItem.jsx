import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

import Teal from '../../../shared/Teal'

export default class CommentItem extends Component {
	render() {
		let c = this.props.comment;
		//onClick={ FlowRouter.path("profile", {}, { objectId: c.contributorId }) }
		return (
			<div className="CommentRow">
				<div key={Teal.newId()} className="valign-wrapper">
					<img className="valign CommentItemProfileImg left" src={ Teal.userPhotoUrl(c.photo) }/>
					<p className="valign CommentItem me" style={{cursor:"pointer"}}>
						{c.text}
					</p>
				</div>
				<p key={Teal.newId()} className="CommentItemDetails">{this.props.comment.name} - {moment(this.props.comment.createdAt).fromNow()}</p>
			</div>
		);
	}
}

CommentItem.propTypes = {
	comment: React.PropTypes.object.isRequired,
}
