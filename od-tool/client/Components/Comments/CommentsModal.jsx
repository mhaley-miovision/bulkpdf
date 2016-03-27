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
	getTipId() {
		return this.props.objectId + "_tip";
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
			<div id={this.getId()} className="modal modal-fixed-footer" style={{maxWidth:600}}>
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
						<ControlIconButton onClicked={this.handleDelete} icon="delete"/>
						<ControlIconButton onClicked={this.handleDismiss} icon="check"/>
					</div>
					<ReactTooltip id={this.getTipId()}/>
				</div>
			</div>
		);
	}
});