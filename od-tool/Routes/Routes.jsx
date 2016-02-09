FlowRouter.route( '/', {
	name: 'home',
	action() {
		ReactLayout.render(App, {yield: <Welcome />});
	}
});

FlowRouter.route( '/goals', {
	name: 'goals',
	action() {
		ReactLayout.render( App, { yield: <MyGoals /> } );
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
	action(params, queryParams) {
		// TODO: validate params
		var objectName = queryParams.objectName;
		var objectType = queryParams.objectType;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";

		console.log("Query Params:", queryParams);
		ReactLayout.render( App, { yield: <MyOrganization
			objectName={objectName}
			objectType={objectType}
			zoomTo={zoomTo}
			mode={mode}
			roleMode={roleMode}
		/> } );
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
