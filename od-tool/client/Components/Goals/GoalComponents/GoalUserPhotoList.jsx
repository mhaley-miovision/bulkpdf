GoalUserPhotoList = React.createClass({

	mixins: [ReactMeteorData],

	getMeteorData() {
		let handle = Meteor.subscribe("teal.roles");

		if (handle.ready()) {
			return { doneLoading: true };
		} else {
			return { doneLoading: false };
		}
	},

	propTypes: {
		emailList : React.PropTypes.array.isRequired,
		heading : React.PropTypes.string,
		compactViewMode : React.PropTypes.bool
	},

	renderPhotos() {
		return this.props.list.map(item => {

			//let url = FlowRouter.path("profile", {}, {objectId: email});
			if (photoUrl) {
				return (
					<a key={email} href={url} style={{margin:horribleHack}}>
						<img key={email} title={email} className="goalItemPhoto" src={photoUrl}/>
					</a>
				);
			} else {
				return (
					<a key={email} href={url} style={{margin:horribleHack}}>
						<img key={email} title={email} className="goalItemPhoto" src="/img/user_avatar_blank.jpg"/>
					</a>
				);
			}
		});
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