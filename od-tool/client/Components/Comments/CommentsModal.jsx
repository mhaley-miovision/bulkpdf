CommentsModal = React.createClass({
	propTypes: {
		comments: React.PropTypes.array.isRequired,
		showAddInput: React.PropTypes.bool,
		title: React.PropTypes.string,
		objectId: React.PropTypes.string.isRequired,
		objectType: React.PropTypes.string.isRequired,
	},

	getInitialState() {
		return {
		}
	},

	getDefaultProps() {
		return { showAddInput: true };
	},

	getId() {
		return this.props.objectId + "_comments";
	},

	handleDismiss() {
		$('#' + this.getId()).closeModal();
	},

	handleDelete() {
		Meteor.call("teal.comments.clear", this.props.objectId, this.props.objectType);
		$('#' + this.getId()).closeModal();
	},

	show() {
		$('#' + this.getId()).openModal();
		if (this.refs && this.refs.commentsList) {
			this.refs.commentsList.initialize();
		} else {
			console.error("commentsList not mounted yet");
		}
	},

	render() {
		return (
			<div id={this.getId()} className="modal modal-fixed-footer" style={{width:600,height:300}}>
				<div className="modal-content" style={{padding:0}}>
					<CommentsList
						ref="commentsList"
						comments={this.props.comments}
						objectId={this.props.objectId}
						objectType={this.props.objectType}
						showAddInput={this.props.showAddInput}/>
				</div>
				<div className="modal-footer">
					<div className="center">
						<i className="material-icons GreyButton" onClick={this.handleDelete}
						   style={{float:"none",marginTop:"7px"}}>delete</i>
						<i className="material-icons GreyButton" onClick={this.handleDismiss}
						   style={{float:"none",marginTop:"7px"}}>check</i>
					</div>
				</div>
			</div>
		);
	}
});