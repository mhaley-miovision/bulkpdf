// App component - represents the whole app
App = React.createClass({
	mixins: [ ReactMeteorData ],
	getMeteorData() {
		return {
			loggingIn: Meteor.loggingIn(),
			hasUser: !!Meteor.user() && Permissions.isEnabledUser(),
			isPublic( route ) {
				let publicRoutes = [
					'login'
				];

				return publicRoutes.indexOf( route ) > -1;
			},
			canView() {
				return this.isPublic( FlowRouter.current().route.name ) || !!Meteor.user();
			}
		};
	},
	loading() {
		return <div className="loading"></div>;
	},
	getView() {
		return this.data.canView() ? this.props.yield : <Login />;
	},

    render() {
		return (
			<div className="app-root">
				<Navbar hasUser={this.data.hasUser}/>
				<div className="container">
					{this.data.loggingIn ? this.loading() : this.getView()}
				</div>
				<Footer hasUser={this.data.hasUser}/>
			</div>
		);
    }
});

if (Meteor.isClient) {
    $(document).ready(function(){
        $('.parallax').parallax();

		// TODO: hack to get the mobile nav to show
		setTimeout(function() {
			$('.button-collapse').sideNav({
					menuWidth: 300, // Default is 240
					edge: 'left', // Choose the horizontal origin
					closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
				}
			);
		}, 1000);
    });

	$(window).load(function() {
		// executes when complete page is fully loaded, including all frames, objects and images
		console.log("window is loaded");
	});

	Meteor.startup(function(){
		// determine root org based on user
		Hooks.init();
	});
}
