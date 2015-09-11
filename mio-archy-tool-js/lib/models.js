'use strict';

function Mioarchy(jobs, rganizationsByName, jobsByName, contributorsByName, applicationsByName, rolesByName) {
    this.jobs = jobs;
    this.applicationsByName = applicationsByName;
    this.contributorsByName = contributorsByName;
    this.rolesByName = rolesByName;
    this.jobsByName = jobsByName;
    this.organizationsByName = organizationsByName;
};

Mioarchy.prototype = {
    getOrganizationChildren: function(organization) {
        var children;
        for (o in organizationsByName) {
           if (o.parent != null) {
                if (o.parent.name.toLowerCase() === organization.toLowerCase()) {
                    children.add(o);
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

function Contributor(id, organization, application, role, accountabilityLevel, accountabilityLabel, employee, primaryAccountability) {
    this.id = id;
    this.organization = organization;
    this.application = application;
    this.role = role;
    this.accountabilityLabel = accountabilityLabel;
    this.accountabilityLevel = accountabilityLevel;
    this.employee = employee;
    this.primaryAccountability;
}

module.exports = {
    Mioarchy: Mioarchy, 
    Application: Application, 
    Role: Role, 
    Organization: Organization, 
    Contributor: Contributor
};

