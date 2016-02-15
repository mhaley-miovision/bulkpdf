Profile = React.createClass({
	mixins: [ReactMeteorData],

	propTypes: {
		objectId : React.PropTypes.string,
	},
	getDefaultProps() {
		return {}
	},

	getMeteorData() {
		let handle = Meteor.subscribe("contributors");
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
			var url1 = FlowRouter.path("organizationView", {}, { objectId: "Computer Vision", objectType:"organization"});
			var url2 = FlowRouter.path("organizationView", {}, { objectId: "Organizational Development", objectType:"organization"});

			return (
				<div>
					<div className="section center">
						<ProfileImage width="128px" height="128px" url={this.data.contributor.photo}/>
						<h5 className="text-main1">{this.data.contributor.name}</h5>
					</div>
					<div className="divider"></div>

					<div className="section">
						<div className="row">
							<div className="col s12 m6">
								<RolesSummaryCard objectId={this.data.contributor.email}/>
							</div>
							<div className="col s12 m6">
								<div>
									<ul className="collection with-header">
										<li className="collection-header summaryCardHeader">Goals</li>
										<li className="collection-item">Computer Vision
											<a href={url1} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
									</ul>
								</div>
							</div>
							<div className="col s12 m6">
								<div>
									<ul className="collection with-header">
										<li className="collection-header summaryCardHeader">Roles</li>
										<li className="collection-item">Computer Vision
											<a href={url1} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
									</ul>
								</div>
							</div>
							<div className="col s12 m6">
								<div>
									<ul className="collection with-header">
										<li className="collection-header summaryCardHeader">Skills</li>
										<li className="collection-item">Computer Vision
											<a href={url1} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
										<li className="collection-item">Organizational Development
											<a href={url2} className="secondary-content"><i className="material-icons tiny">search</i></a></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return <Loading />;
		}
	}});