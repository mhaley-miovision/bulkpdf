// App component - represents the whole app
App = React.createClass({
	mixins: [ ReactMeteorData ],
	getMeteorData() {
		return {
			loggingIn: Meteor.loggingIn(),
			hasUser: !!Meteor.user(),
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
		return <div className="app-root">
			<Navbar hasUser={this.data.hasUser}/>
			<div className="container">
				{this.data.loggingIn ? this.loading() : this.getView()}
			</div>
			<Footer hasUser={this.data.hasUser}/>
		</div>;
    }
});

if (Meteor.isClient) {
    $(document).ready(function(){
        $('.parallax').parallax();
    });

	Meteor.startup(function(){
		Hooks.init();
	});
}
