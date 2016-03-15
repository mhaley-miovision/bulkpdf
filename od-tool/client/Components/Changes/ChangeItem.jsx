ChangeItem = React.createClass({
	propTypes: {
		change: React.PropTypes.object.isRequired,
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

	render() {
		var c = this.props.change;
		let photoUrl = c.photo ? c.photo : "/img/user_avatar_blank.jpg";
		let changedString = c.createdByName + " " + Teal.changeObjectToString(c);
		let changeParams = c.changeParams.join('<br/>');
		return (
			<div className="collection-item">
				<img id={c.createdBy} key={c._id} className="goalItemPhoto" src={photoUrl}
					 data-tip={c.createdByName} onClick={this.gotoUserProfile}/>

				&nbsp;&nbsp;

				<span data-tip={changeParams}>{changedString}</span>

				<span className="text-main5"> - {moment(c.createdAt).fromNow()}</span>
			</div>
		);
	},
});