Requests = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		let handle = Meteor.subscribe('teal.changes');
		if (handle.ready()) {
			let r = ChangesCollection.find({},{sort:{createdAt:-1}}).fetch();
			return { doneLoading: true, changes: r };
		}
		return { doneLoading: false };
	},

	renderChanges() {
		if (this.data.doneLoading) {
			return this.data.changes.map(c => {
				return <ChangeItem key={c._id} change={c}/>
			})
		}
	},

	renderClearButton() {
		if (Permissions.isAdmin()){
			return (
				<div className="center">
					<a className="waves-effect waves-light btn" onClick={this.clearChangeList}>Clear</a>
					<br/>
					<br/>
				</div>
			);
		}
	},

	clearChangeList() {
		Meteor.call("teal.changes.clearList");
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<br/>
					<header>
						<h3 className="center header text-main1">Change List</h3>
					</header>
					<br/>

					{this.renderClearButton()}

					<div className="collection">
						{this.renderChanges()}
					</div>

					<br/>

					<ReactTooltip multiline={true} place="bottom"/>
				</div>
			);
		} else {
			return <Loading />
		}
	}
});