TeamsSummary = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId: React.PropTypes.string.isRequired,
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.contributors");
		let handle2 = Meteor.subscribe("teal.roles");

		if (handle.ready() && handle2.ready()) {
			let orgs = _.uniq(RolesCollection.find({email:this.props.objectId}, {
				sort: {organization: 1}, fields: {organization: true}
			}).fetch().map(function(x) {
				return x.organization;
			}), true);

			let homeOrg = ContributorsCollection.findOne({email:this.props.objectId}).physicalTeam;

			return { doneLoading: true, orgs: orgs, homeOrg: homeOrg }
		} else {
			return { doneLoading: false };
		}
	},

	renderOrgControls(o) {
		let controls = [];

		// TODO: implement actually jumping to the role, not the contributor
		var url = FlowRouter.path("organizationView", {}, { objectId: o, objectType:"organization"});

		// public controls
		controls.push(
			<a key={o} href={url} className="secondary-content">
				<i className="material-icons summaryCardIcon grey-text">search</i>
			</a>
		);

		return controls;
	},

	renderTeams() {
		if (this.data.doneLoading) {
			return this.data.orgs.map(o => {
				return (
					<li className="collection-item" key={o}>
						<div className="collection-item-text">
							{o}
						</div>
						{this.renderOrgControls(o)}
					</li>
				);
			});
		}
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<ul className="collection with-header">
						<li className="collection-header summaryCardHeader">Teams</li>
						{this.renderTeams()}
					</ul>
				</div>
			);
		} else {
			return <Loading spinner={true}/>
		}
	}
});