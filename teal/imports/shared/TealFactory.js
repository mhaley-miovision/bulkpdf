import Teal from './Teal';
import { Meteor } from 'meteor/meteor';

export default {
	createGoal(_id, parent, name, keyObjectives, doneCriteria, ownerRoles, contributorRoles, state, dueDate) {
		// TODO: parameter validation, for now we only get the abstraction benefits
		return {
			type:ObjectTypes.Goal,
			rootOrgId:Teal.rootOrgIg(),
			_id:_id,
			parent:parent,
			name:name,
			keyObjectives:keyObjectives,
			doneCriteria:doneCriteria,
			ownerRoles:ownerRoles,
			contributorRoles:contributorRoles,
			state:state,
			dueDate:dueDate,
			path: [],
		}
	},
	createOrganization(_id, name, parent, parentId, startDate, endDate) {
		// TODO: parameter validation, for now we only get the abstraction benefits
		return {
			type:Teal.ObjectTypes.Organization,
			rootOrgId:Teal.rootOrgIg(),
			_id:_id,
			name:name,
			parent:parent,
			parentId:parentId,
			startDate:startDate,
			endDate:endDate,
			path: []
		}
	},
	createRole(_id, label, accountabilityLevel, organization, organizationId, contributor, contributorId, startDate,
			   endDate, isExternal, isLeadNode, isPrimaryAccountabilty, accountabilities) {
		// TODO: parameter validation, for now we only get the abstraction benefits
		return {
			type: Teal.ObjectTypes.Role,
			rootOrgId:Teal.rootOrgIg(),
			_id: _id,
			label: label,
			accountabilityLevel: accountabilityLevel,
			organization: organization,
			organizationId: organizationId,
			contributor: contributor,
			contributorId: contributorId,
			startDate: startDate,
			endDate: endDate,
			isExternal: isExternal,
			isLeadNode: isLeadNode,
			isPrimaryAccountabilty: isPrimaryAccountabilty,
			accountabilities: accountabilities
		};
	}
};
