OrganizationSelector = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		var handle = Meteor.subscribe("organizations");

		var data = { isLoading: handle.ready() }

		if (!data.isLoading) {

		}
		return data;
	},

	render() {
		return <span>DROPDOWN UNDER CONSTRUCTION...</span>
	}
});
