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

		// TODO: get rid of this stuff and put it into changes somewhere tucked away neatly where it belongs
		let changedObjectDescriptor = '';
		if (this.props.change.oldValue && this.props.change.oldValue.name) {
			changedObjectDescriptor = this.props.change.oldValue.name;
		} else if (this.props.change.changeParams.length == 1 && this.props.change.changeParams.name) {
			changedObjectDescriptor = this.props.change.changeParams.name;
		} else if (this.props.change.oldValue && this.props.change.oldValue.accountabilityLabel) {
			changedObjectDescriptor = this.props.change.oldValue.accountabilityLabel;
		}
		console.log(this.props.change.oldValue);

		return (
			<div className="collection-item">
				<img id={c.createdBy} key={c._id} className="goalItemPhoto" src={photoUrl}
					 data-tip={c.createdByName} onClick={this.gotoUserProfile}/>

				&nbsp;&nbsp;

				<span data-tip={TealChanges.getChangeSummaryHtml(this.props.change)}>{changedString}

					<span className="text-main2">{ changedObjectDescriptor ? (' '+changedObjectDescriptor+'') : ''}</span>
				</span>

				<span className="text-main5"> - {moment(c.createdAt).fromNow()}</span>
			</div>
		);
	},
});