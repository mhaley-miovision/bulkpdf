Admin = React.createClass({
	mixins: [ReactMeteorData],

	getMeteorData() {
		var u = Meteor.users.findOne(Meteor.userId);
		return {
			isAuthorized: Roles.userIsInRole(Meteor.user(), 'admin')//, u.rootOrgId)
		}
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (this.data.isAuthorized) {
			return (
				<div>
					<br />
					<div className="container">
						<header>
							<h3 className="center header text-main1">Data Import</h3>
						</header>
						<div className="row">
							<div className="col s12 m4 offset-m4">
								<ImportPanel id="importODPanel" label="Import All Data" method="teal.import.importAllData"/>
							</div>
						</div>
						<div className="row">
							<div className="col s12 m4">
								<ImportPanel id="importODPanel" label="Import OD info" method="teal.import.v1ImportDatabase"/>
							</div>
							<div className="col s12 m4">
								<ImportPanel id="importGoalsPanel" label="Import company goals" method="teal.import.importGoals"/>
							</div>
							<div className="col s12 m4">
								<ImportPanel id="userPhotosPanel" label="Import user photo info" method="teal.import.importUserPhotoInfo"/>
							</div>
						</div>
					</div>
					<br />
					<RoleLabels />
				</div>
			);
		} else {
			return (
				<Unauthorized />
			);
		}
	}});