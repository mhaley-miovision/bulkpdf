'use strict';

function Mioarchy(jobs, orgs, contribs, apps, roles, accountabilities) {
    this.jobs = jobs;
    this.applications = apps;
    this.contributors = contribs;
    this.roles = roles;
    this.organizations = orgs;
    this.accountabilities = accountabilities;
};

Mioarchy.prototype = 
{
    Types: { Job:0, Application:1, Contributor:2, Role:3, Organization:4 },

    // returns the # of immediate childen of the given organization (does not recurse)
    getOrganizationChildren: function(organization) 
    {
        // loop through all orgs
        // if the org identifies having a parent with the same name as the specified org, we add it to the list of children of that org

        var children = [];
        var orgNames = Object.keys( this.organizations );

        for (var i = 0; i < orgNames.length; i++) 
        {
            // the current org to check for being a parent
            var o = this.organizations[ orgNames[i] ];

            if (o.parent) 
            {
                if (o.parent.toLowerCase() === organization.name.toLowerCase()) {
                    children.push( o );
                }
            }
        }
        return children;
    },
    getOrganizationJobs: function(organization, recurse) {
        var list = [];

        // jobs at sub levels
        if (recurse) {
            for (var o in this.getOrganizationJobs( organization )) {
                list.push(o);
            }
        }
        // jobs at this level
        for (var c in this.jobs) {
            // make sure the job is attached to an org
            var jobOrgName = this.jobs[c].organization;
            if (jobOrgName) {
                // see if the names match
                if (jobOrgName.toLowerCase() === organization.name.toLowerCase()) {
                    list.push(c);
                }
            }
        }
        return list;
    },
    isDescendantOfOrganization: function(testSubject, desiredParent) {
        if (testSubject.parent) {
            // is this the parent we are looking for?
            if (testSubject.parent.toLowerCase() === desiredParent.name.toLowerCase()) {
                return true; // yes, this is the parent, thus it's a descendant
            } else {
                // try looking to the parent's parent
                var parent = this.organizations[testSubject.parent];
                return this.isDescendantOfOrganization( parent, desiredParent );
            }
        } else {
            // this org has no parent
            return false;
        }
    },
    // returns the # of immediate childen of the given organization (does not recurse)
    getContributorJobs: function(organization)
    {
        // loop through all orgs
        // if the org identifies having a parent with the same name as the specified org, we add it to the list of children of that org

        var children = [];
        var orgNames = Object.keys( this.organizations );

        for (var i = 0; i < orgNames.length; i++)
        {
            // the current org to check for being a parent
            var o = this.organizations[ orgNames[i] ];

            if (o.parent)
            {
                if (o.parent.toLowerCase() === organization.name.toLowerCase()) {
                    children.push( o );
                }
            }
        }
        return children;
    },
    loadFromObject: function(obj) {
        if (obj.type) {
            if (obj.type === Mioarchy.prototype.Types.Application) {
                return new Application(obj.id, obj.name, obj.parent);
            } else if (obj.type === Mioarchy.prototype.Types.Role) {
                return new Role(obj.id, obj.name);
            } else if (obj.type === Mioarchy.prototype.Types.Organization) {
                return new Organization(obj.id, obj.name, obj.parent);
            } else if (obj.type === Mioarchy.prototype.Types.Contributor) {
                return new Contributor(obj.id, obj.name, obj.firstName, obj.lastName);
            } else if (obj.type === Mioarchy.prototype.Types.Job) {
                return new Job(obj.id, obj.organization, obj.application, obj.role,
                    obj.accountabilityLevel, obj.accountabilityLabel, obj.contributor, obj.primaryAccountability);
            }
        }
    }
};

function Application(id, name, parent) {
    this.type = Mioarchy.prototype.Types.Application;
    this.id = id;
    this.name = name;
    this.parentOrg = parent;
}

function Role(id, name) {
    this.type = Mioarchy.prototype.Types.Role;
    this.id = id;
    this.name = name;
}

function Organization(id, name, parent) {
    this.type = Mioarchy.prototype.Types.Organization;
    this.id = id;
    this.name = name;
    this.parent = parent;
}

function Contributor(id, name, firstName, lastName) {
    this.type = Mioarchy.prototype.Types.Contributor;
    this.id = id;
    this.name = name;
    this.firstName = firstName;
    this.lastName = lastName;
}

function Job(id, organization, application, role, accountabilityLabel, accountabilityLevel, contributor, primaryAccountability) {
    this.type = Mioarchy.prototype.Types.Job;
    this.id = id;
    this.organization = organization;
    this.application = application;
    this.role = role;
    this.accountabilityLabel = accountabilityLabel;
    this.accountabilityLevel = accountabilityLevel;
    this.contributor = contributor;
    this.primaryAccountability = primaryAccountability;
}

function Accountabilities(id, job, jobId, accountabilities)
{
    this.id = id;
    this.job = job;
    this.jobId = jobId;
    this.accountabilities = accountabilities;
}

// module is only define in nodejs context, if this is client side, ignore since the context is 'window'
if ( typeof(module) != "undefined" ) {
    module.exports = {
        Mioarchy: Mioarchy, 
        Application: Application, 
        Role: Role, 
        Organization: Organization, 
        Contributor: Contributor, 
        Job: Job,
        Accountabilities: Accountabilities
    };
}

