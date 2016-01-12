MyTeam = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		var handle = Meteor.subscribe("contributors");

		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var myUserName = Meteor.user().profile.name;
		var contributor = ContributorsCollection.findOne ({ name: myUserName });
		var organization = contributor ? contributor.physicalTeam : null;

		var data = {
			isLoading: !handle.ready(),
			org: organization
		};

		console.log(data);

		return data;
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (this.data.org) {
			return <Organization org={this.data.org}/>;
		} else {
			return (
				<div className="row centeredCard">
					<div className="col s12 m6">
						<div className="card blue-grey darken-1">
							<div className="card-content white-text">
								<span className="card-title">You are not part of any team</span>
								<p>Please ask your administrator to add you.</p>
							</div>
							<div className="card-action">
								<a href="/">Take me home!</a>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}});