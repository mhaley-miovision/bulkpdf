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

	renderChangeDescriptor() {
		let changedObjDescriptor = TealChanges.changeObjectToDescriptorString(this.props.change);
		if (changedObjDescriptor !== '') {
			return <span className="text-main5"> - <span className="text-main2">{ changedObjDescriptor }</span></span>
		}
	},

	render() {
		var c = this.props.change;
		let changeDesc = TealChanges.changeObjectToString(c);
		let changedString = c.createdByName + ' ' + (changeDesc ? changeDesc : 'made a change');

		return (
			<div className="collection-item">
				<img id={c.createdBy} key={c._id} className="goalItemPhoto" src={Teal.userPhotoUrl(c.photo)}
					 data-tip={c.createdByName} onClick={this.gotoUserProfile}/>

				&nbsp;&nbsp;

				<span data-tip={TealChanges.getChangeSummaryHtml(this.props.change)}>
					{changedString}
					{ this.renderChangeDescriptor() }
				</span>

				<span className="text-main5"> - {moment(c.createdAt).fromNow()}</span>
			</div>
		);
	},
});