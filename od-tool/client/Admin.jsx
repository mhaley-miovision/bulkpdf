Admin = React.createClass({
	mixins: [ReactMeteorData],

	getInitialState() {
		return { roleMode: true };
	},

	getMeteorData() {
		var handle = Meteor.subscribe("contributors");

		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		var myUserName = Meteor.user().profile.name;

		isAuthorized = myUserName === 'Victor Leipnik';

		var data = {
			isLoading: !handle.ready(),
			isAuthorized: isAuthorized
		};

		return data;
	},

	componentDidMount() {
		this.forceUpdate();
	},

	handleRoleModeChanged(event) {
		console.log(this.refs.roleMode.checked);
		this.setState( {roleMode: !this.refs.roleMode.checked });
	},

	render() {
		if (this.data.isLoading) {
			return <Loading/>;
		} else if (isAuthorized) {
			return (
				<div>
					<br />
					<div className="container">
						<header>
							<h3 className="center header text-main1">Data Import</h3>
						</header>
						<div className="row">
							<div className="col s12 m4">
								<ImportPanel id="importODPanel" label="Import OD info" method="v1ImportDatabase"/>
							</div>
							<div className="col s12 m4">
								<ImportPanel id="importGoalsPanel" label="Import company goals" method="importGoals"/>
							</div>
							<div className="col s12 m4">
								<ImportPanel id="userPhotosPanel" label="Import user photo info" method="importUserPhotoInfo"/>
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