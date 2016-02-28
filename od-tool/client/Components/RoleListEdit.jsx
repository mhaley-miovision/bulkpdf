RoleListEdit = React.createClass({

	mixins: [ReactMeteorData],

	getMeteorData() {
		let handle = Meteor.subscribe("teal.roles");

		if (handle.ready()) {
			let roles = RolesCollection.find(
				{ email: { $in : this.props.emailList } },
				{ fields: { photo:1, label:1, accountabilityLabel:1, contributor:1, _id:1, email:1 } }
			).fetch();
			return { doneLoading: true, roles: roles };
		} else {
			return { doneLoading: false };
		}
	},

	propTypes: {
		emailList : React.PropTypes.array.isRequired,
		heading : React.PropTypes.string,
		compactViewMode : React.PropTypes.bool
	},

	handleOnClick(event) {
		if (event.target.id) {
			//TODO:
			console.log("will remove r.id(" + event.target.id+")");
		}
	},

	renderPhotos() {
		if (this.data.doneLoading) {
			return this.data.roles.map(role => {
				//let url = );
				return (
					<div className="chip">
						<a href={ FlowRouter.path("profile", {}, {objectId: email}) }>
							<img src={ role.photo ? role.photo : "img/user_avatar_blank.jpg"} alt="Contact Person"/>
						</a>
						{ role.contributor ? role.contributor : "&lt;unfilled&gt;" }
						<i className="material-icons " onClick={this.handleOnClick} id={"r_"+role._id}>close</i>
					</div>
				);
			});
		} else {
			return <Loading spinner={true}/>
		}
	},

	render() {
		return (
			<div className="GoalOwnersSection">
				{ this.props.heading ?
					<div
						className="GoalSummaryHeading">{this.props.heading + (this.props.list.length > 1 ? "s" : "")}</div>
					: ''
				}
				<div className="GoalOwnerPhotos">{this.renderPhotos()}</div>
			</div>
		);
	}
});