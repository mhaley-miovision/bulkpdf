import { Mongo } from 'meteor/mongo';

export const ApplicationsCollection = new Mongo.Collection("teal.applications");
export const ContributorsCollection = new Mongo.Collection("teal.contributors");
export const EnpsCollection = new Mongo.Collection("teal.enps");
export const FeedbackCollection = new Mongo.Collection("teal.feedback");
export const GoalsCollection = new Mongo.Collection("teal.goals");
export const NotificationsCollection = new Mongo.Collection("teal.notifications");
export const OrganizationsCollection = new Mongo.Collection("teal.organizations");
export const OrgAccountabilitiesCollection = new Mongo.Collection("teal.org_accountabilities");
export const RoleAccountabilitiesCollection = new Mongo.Collection("teal.role_accountabilities");
export const RoleLabelsCollection = new Mongo.Collection("teal.role_labels");
export const RolesCollection = new Mongo.Collection("teal.roles");
export const SkillsCollection = new Mongo.Collection("teal.skills");
export const GoogleUserCacheCollection = new Mongo.Collection("teal.googleUsersCache");
export const ChangesCollection = new Mongo.Collection("teal.changes");
export const AccountabilityLevelsCollection = new Mongo.Collection("teal.accountability_levels");
