GoalUserPhotoList = React.createClass({
	propTypes: {
		list : React.PropTypes.array.isRequired,
		heading : React.PropTypes.string,
	},

	renderPhotos() {
		return this.props.list.map(item => {
			let email = item.email;
			let photoUrl = item.photo;
			let url = FlowRouter.path("profile", {}, {objectId: email});
			if (photoUrl) {
				return (
					<a key={email} href={url}>
						<img key={email} title={email} className="goalItemPhoto" src={photoUrl}/>
					</a>
				);
			} else {
				return (
					<a key={email} href={url}>
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
						className="GoalOwnersHeading">{this.props.heading + (this.props.list.length > 1 ? "s" : "")}</div>
					: ''
				}
				<div className="GoalOwnerPhotos center">{this.renderPhotos()}</div>
			</div>
		);
	}
});