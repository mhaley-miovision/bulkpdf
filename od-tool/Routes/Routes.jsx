FlowRouter.route( '/', {
	name: 'home',
	action() {
		ReactLayout.render(App, {yield: <Welcome />});
	}
});

FlowRouter.route( '/goals', {
	name: 'goals',
	action() {
		ReactLayout.render( App, { yield: <GoalList /> } );
	}
});

FlowRouter.route( '/tasks', {
	name: 'tasks',
	action() {
		ReactLayout.render( App, { yield: <TaskList /> } );
	}
});

FlowRouter.route( '/login', {
	name: 'login',
	action() {
		ReactLayout.render( App, { yield: <Login /> } );
	}
});

FlowRouter.route( '/profile', {
	name: 'profile',
	action() {
		ReactLayout.render( App, { yield: <MyProfile /> } );
	}
});

FlowRouter.route( '/team', {
	name: 'team',
	action() {
		ReactLayout.render( App, { yield: <MyTeam /> } );
	}
});

FlowRouter.route( '/organization', {
	name: 'organization',
	action() {
		ReactLayout.render( App, { yield: <MyOrganization /> } );
	}
});

FlowRouter.route( '/admin', {
	name: 'admin',
	action() {
		ReactLayout.render( App, { yield: <Admin /> } );
	}
});

FlowRouter.route( '/enps', {
	name: 'enps',
	action() {
		ReactLayout.render( App, { yield: <ENPS /> } );
	}
});
