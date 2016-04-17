import { FlowRouter } from 'meteor/kadira:flow-router';

let pathFor = ( path, params ) => {
	let query = params && params.query ? FlowRouter._qs.parse( params.query ) : {};
	return FlowRouter.path( path, params, query );
};

let urlFor = ( path, params ) => {
	return Meteor.absoluteUrl( pathFor( path, params ) );
};

let currentRoute = ( route ) => {
	FlowRouter.watchPathChange();
	return FlowRouter.current().route.name === route ? 'active' : '';
};

export default FlowHelpers = {
	pathFor: pathFor,
	urlFor: urlFor,
	currentRoute: currentRoute
};
