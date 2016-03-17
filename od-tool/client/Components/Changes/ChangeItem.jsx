ChangeItem = React.createClass({
	propTypes: {
		change: React.PropTypes.object.isRequired,
	},

	getInitialState() {
		return { modalId: Teal.newId() };
	},

	gotoUserProfile(e) {
		let id = e.currentTarget.id;
		let c = ContributorsCollection.findOne({_id:id});
		if (c & c.email) {
			let url = FlowRouter.path("profile", {}, {objectId: email});
			FlowRouter.go(url);
		} else {
			Materialize.toast("Couldn't find user with id: " + id, 3000);
		}
	},

	showModal() {
		$('#'+this.state.modalId).openModal();
	},

	render() {
		var c = this.props.change;
		let photoUrl = c.photo ? c.photo : "/img/user_avatar_blank.jpg";
		let changedString = c.createdByName + " " + TealChanges.changeObjectToString(c);
		return (
			<div className="collection-item">
				<img id={c.createdBy} key={c._id} className="goalItemPhoto" src={photoUrl}
					 data-tip={c.createdByName} onClick={this.gotoUserProfile}/>

				&nbsp;&nbsp;

				<span data-tip={TealChanges.getChangeSummaryHtml(this.props.change)}>{changedString}</span>

				<span className="text-main5"> - {moment(c.createdAt).fromNow()}</span>
			</div>
		);
	},
});