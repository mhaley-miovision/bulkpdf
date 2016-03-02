Requests = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		let handle = Meteor.subscribe('teal.requests');
		if (handle.ready()) {
			let r = RequestsCollection.find({});
			return { doneLoading: true, requests: r };
		}
		return { doneLoading: false };
	},

	render() {
		return <NotImplementedYet/>;
		if (this.data.doneLoading) {
			return <NotImplementedYet/>
		} else {
			return <Loading />
		}
	}
});