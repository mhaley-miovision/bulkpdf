GoalUserPhotoList = React.createClass({
	propTypes: {
		list : React.PropTypes.array.isRequired,
		heading : React.PropTypes.string,
	},

	renderPhotos() {
		return this.props.list.map(item => {
			//TODO: CSS Positioning horrible hack - no friggin clue why the
			let horribleHack = this.props.compactViewMode && this.props.list.length == 1 ? "13px" : "0";
			let email = item.email;
			let photoUrl = item.photo ? item.photo : "/img/user_avatar_blank.jpg";
			let url = FlowRouter.path("profile", {}, {objectId: email});
			return (
				<a key={email} href={url} style={{margin:horribleHack}} data-tip={item.accountabilityLabel}>
					<img key={item._id} title={email} className="goalItemPhoto" src={photoUrl}/>
				</a>
			);
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
				<ReactTooltip place="bottom"/>
			</div>
		);
	}
});