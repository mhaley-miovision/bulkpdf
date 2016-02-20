Profile = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId : React.PropTypes.string,
	},
	getDefaultProps() {
		return {}
	},

	getMeteorData() {
		let handle = Meteor.subscribe("teal.contributors");
		let handle2 = Meteor.subscribe("users");
		if (handle.ready() && handle2.ready()) {
			// default is current user
			let email = this.props.objectId;
			if (!email) {
				var myUser = Meteor.users.findOne({_id: Meteor.userId()});
				email = myUser.services.google.email;
			}
			// find the contributor
			let c = ContributorsCollection.findOne({email:email});
			return {
				contributor: c,
				doneLoading: true
			}
		} else {
			return { doneLoading: false };
		}
	},

	render() {
		if (this.data.doneLoading) {
			return (
				<div>
					<div className="section center">
						<ProfileImage width="128px" height="128px" url={this.data.contributor.photo ? this.data.contributor.photo : "/img/user_avatar_blank.jpg"}/>
						<h5 className="text-main1">{this.data.contributor.name}</h5>
					</div>
					<div className="divider"></div>

					<div className="section">
						<div className="row">
							<div className="col s12 m6">
								<RolesSummary objectId={this.data.contributor.email}/>
							</div>
							<div className="col s12 m6">
								<GoalsSummary objectId={this.data.contributor.email}/>
							</div>
						</div>
						<div className="row">
							<div className="col s12 m6">
								<TeamsSummary objectId={this.data.contributor.email}/>
							</div>
							<div className="col s12 m6">
								<SkillsSummary objectId={this.data.contributor.email}/>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return <Loading />;
		}
	}});