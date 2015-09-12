'use strict';

function Mioarchy(jobs, orgs, contribs, apps, roles) {
    this.jobs = jobs;
    this.applications = apps;
    this.contributors = contribs;
    this.roles = roles;
    this.jobs = jobs;
    this.organizations = orgs;
};

Mioarchy.prototype = 
{    
    getOrganizationChildren: function(organization) {
        var children = [];
        for (o in organizations) {
           if (o.parent != null) {
                if (o.parent.name.toLowerCase() === organization.toLowerCase()) {
                    children.push(o);
                }
            }
        }
        return children;
    },
    getOrganizationJobs: function(organization, recurse) {
        var list = [];
        // jobs at sub levels
        if (recurse) {
            for (o in this.getOrganizationChildren(organization)) {
                list.push(o);
            }
        }
        // jobs at this level
        for (c in jobs) {
            if (c.organization != null) {
                if (c.organization.name.toLowerCase() === organization.name.toLowerCase()) {
                    list.push(c);
                }
            }
        }
        return list;
    },
    isDescendantOfOrganization: function(testSubject, desiredParent) {
        if (testSubject.parent == null || testSubject.parent.name == null || desiredParent == null || desiredParent.name == null)
            return false;
        if (testSubject.parent.name.toLowerCase() === desiredParent.name.toLowerCase())
            return true;
        return isDescendantOfOrganization(testSubject.parent, desiredParent);
    }
};

function Application(id, name, parent) {
    this.id = id;
    this.name = name;
    this.parentOrg = parent;
}

function Role(id, name) {
    this.id = id;
    this.name = name;
}

function Organization(id, name, parent) {
    this.id = id;
    this.name = name;
    this.parent = parent;
}

function Contributor(id, name, firstName, lastName) {
    this.id = id;
    this.name = name;
    this.firstName = firstName;
    this.lastName = lastName;
}

function Job(id, organization, application, role, accountabilityLevel, accountabilityLabel, contributor, primaryAccountability) {
    this.id = id;
    this.organization = organization;
    this.application = application;
    this.role = role;
    this.accountabilityLabel = accountabilityLabel;
    this.accountabilityLevel = accountabilityLevel;
    this.contributor = contributor;
    this.primaryAccountability;
}

// module is only define in nodejs context, if this is client side, ignore since the context is 'window'
if (typeof(module) != "undefined") {
    module.exports = {
        Mioarchy: Mioarchy, 
        Application: Application, 
        Role: Role, 
        Organization: Organization, 
        Contributor: Contributor, 
        Job: Job
    };
}

