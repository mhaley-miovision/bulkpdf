// Import this file for easy access to collections

import {AccountabilityLevelsCollection} from './accountability_levels'
import {ChangesCollection} from './changes'
import {RoleLabelsCollection} from './role_labels'
import {ContributorsCollection} from './contributors'
import {EnpsCollection} from './enps'
import {FeedbackCollection} from './feedback'
import {GoalsCollection} from './goals'
import {GoogleUserCacheCollection} from './googleUsersCache'
import {IgnoredImportUsersCollection} from './users'
import {NotificationsCollection} from './notifications'
import {OrganizationsCollection} from './organizations'
import {RoleAccountabilitiesCollection} from './role_accountabilities'
import {RolesCollection} from './roles'
import {SkillsCollection} from './skills'
import {TasksCollection} from './tasks'

var Collections = {
	AccountabilityLevels: AccountabilityLevelsCollection,
	Changes: ChangesCollection,
	RoleLabels: RoleLabelsCollection,
	Contributors: ContributorsCollection,
	Enps: EnpsCollection,
	Feedback: FeedbackCollection,
	Goals: GoalsCollection,
	GoogleUserCache: GoogleUserCacheCollection,
	IgnoredImportUsersCollection: IgnoredImportUsersCollection,
	Notifications: NotificationsCollection,
	Organizations: OrganizationsCollection,
	RoleAccountabilities: RoleAccountabilitiesCollection,
	Roles: RolesCollection,
	Skills: SkillsCollection,
	Tasks: TasksCollection
}

export default Collections;
