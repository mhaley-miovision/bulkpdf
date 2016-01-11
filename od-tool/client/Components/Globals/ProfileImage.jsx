ProfileImage = React.createClass({
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	// Loads items from the Tasks collection and puts them on this.data.tasks
	getMeteorData() {
		var handle = Meteor.subscribe("users");
		var data = { profilePhotoUrl: "" }; //"img/user_avatar_blank.jpg" };
		if (handle.ready()) {
			console.log(Meteor.user()._id);

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
		return (
			<img className="profileImg" src={this.data.profilePhotoUrl}/>
		);
	}
});