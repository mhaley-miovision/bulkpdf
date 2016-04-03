import React from 'react'
import { mount } from 'react-mounter'

import { Layout } from '../../ui/layouts/layout.jsx'

import Admin from '../../ui/pages/Admin.jsx'
import MyENPS from '../../ui/pages/MyENPS.jsx'
import MyGoals from '../../ui/pages/MyGoals.jsx'
import MyChanges from '../../ui/pages/MyChanges.jsx'
import MyOrganization from '../../ui/pages/MyOrganization.jsx'
import MyProfile from '../../ui/pages/MyProfile.jsx'
import MyTeam from '../../ui/pages/MyTeam.jsx'
import Welcome from '../../ui/pages/Welcome.jsx'
import NotImplementedYet from '../../ui/components/error_states/NotImplementedYet.jsx'

FlowRouter.route( '/', {
    name: '',
    action() {
        mount(Layout, {
            content: (<MyProfile/>)
        });
    }
});

FlowRouter.route( '/goals', {
	name: 'goals',
	action() {
		mount(Layout, {
			content: ( <MyGoals />)
		});
	}
});

FlowRouter.route( '/tasks', {
	name: 'tasks',
	action() {
		mount(Layout, {
			content: ( <TaskList />)
		});
	}
});

FlowRouter.route( '/login', {
	name: 'login',
	action() {
		mount(Layout, {
			content: ( <Login />)
		});
	}
});

FlowRouter.route( '/profile', {
	name: 'profile',
	action(params, queryParams) {
		var objectId = queryParams.objectId;
		mount(Layout, {
			content: (<Profile objectId={objectId}/>)
		})
	}
});

FlowRouter.route( '/team', {
	name: 'team',
	action() {
		mount(Layout, {
			content: <MyTeam />
		});
	}
});

FlowRouter.route( '/organization', {
	name: 'organization',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var objectType = queryParams.objectType;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		mount(Layout, {
			content: <MyOrganization
				objectId={objectId}
				objectType={objectType}
				zoomTo={zoomTo}
				mode={mode}
				roleMode={roleMode} />
		});
	}
});

FlowRouter.route( '/goals/tree', {
	name: 'goalsTree',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		mount(Layout, {
			content: <Tree
				objectId={objectId}
				objectType='role'
				zoomTo={zoomTo}
				mode={mode}
				roleMode={roleMode}
			/>
		});
	}
});

FlowRouter.route( '/goals/subGoals', {
	name: 'goalSubGoals',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		mount(Layout, {
			content: ( <GoalSubGoals objectId={objectId}/> )
		});
	}
});

FlowRouter.route( '/goals/:goalId', {
	name: 'goalById',
	action(params, queryParams) {
		// TODO: validate params
		let goalId = params.goalId;
		let showBackButton = queryParams.showBackButton ? queryParams.showBackButton.toLowerCase() === 'true' : false;
		mount(Layout, {
			content: ( <GoalById goalId={goalId} showBackButton={showBackButton}/> )
		});
	}
});

FlowRouter.route( '/goals/list/contributor', {
	name: 'goalsList',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		mount(Layout, {
			content: ( <GoalList
				objectId={objectId}
				objectType='role'
				zoomTo={zoomTo}
				mode={mode}
				roleMode={roleMode}
			/> )
		});
	}
});

FlowRouter.route( '/organization/view', {
	name: 'organizationView',
	action(params, queryParams) {
		// TODO: validate params
		var objectId = queryParams.objectId;
		var zoomTo = queryParams.zoomTo;
		var mode = queryParams.mode;
		var roleMode = queryParams.roleMode && queryParams.roleMode.toLowerCase() == "true";
		mount(Layout, {
			content: ( <Organization
				objectId={objectId}
				objectType='role'
				zoomTo={zoomTo}
				mode={mode}
				roleMode={roleMode}
			/> )
		});
	}
});

FlowRouter.route( '/changes', {
	name: 'changes',
	action() {
		mount(Layout, {
			content: ( <MyChanges /> )
		});
	}
});

FlowRouter.route( '/admin', {
	name: 'admin',
	action() {
		mount(Layout, {
			content: ( <Admin /> )
		});
	}
});

FlowRouter.route( '/enps', {
	name: 'enps',
	action() {
		mount(Layout, {
			content: ( <MyENPS /> )
		});
	}
});

FlowRouter.route( '/designer', {
	name: 'designer',
	action() {
		mount(Layout, {
			content: ( <NotImplementedYet /> )
		});
	}
});


