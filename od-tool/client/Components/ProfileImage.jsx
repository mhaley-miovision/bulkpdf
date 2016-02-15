ProfileImage = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	getDefaultProperties() {
		return {
			width: '32px',
			height: '32px',
			verticalAlign: 'middle',
			textAlign: 'center',
			WebkitFilter: 'opacity(50%)',
		}
	},

	// Loads items from the Tasks collection and puts them on this.data.tasks
	getMeteorData() {
		var handle = Meteor.subscribe("users");
		var data = { profilePhotoUrl: "" }; //"/img/user_avatar_blank.jpg" };
		if (handle.ready()) {
			var usr = Meteor.users.findOne({ _id : Meteor.user()._id });
			if (usr) {
				data.profilePhotoUrl = usr.services.google.picture;
			}
		}
		return data;
	},

	render() {
		if (!Meteor.userId()) {
			return "";
		}
		var divStyle = {
			maxWidth: this.props.width,
			maxHeight: this.props.height,
			borderRadius: '50%',
			verticalAlign: 'middle',
			margin: '15px',
			WebkitFilter: this.props.WebkitFilter,
			textAlign: this.props.textAlign,
			verticalAlign: this.props.verticalAlign,
		};

		return (
			<img style={divStyle} className="profileImg" src={this.data.profilePhotoUrl}/>
		);
	}
});