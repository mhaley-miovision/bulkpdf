'use strict';

function Mioarchy(jobs, orgs, contribs, apps, roles, orgAccountabilites, jobAccountabilities) {
    this.jobs = jobs;
    this.applications = apps;
    this.contributors = contribs;
    this.roles = roles;
    this.organizations = orgs;
    this.orgAccountabilities = orgAccountabilites;
    this.jobAccountabilities = jobAccountabilities;

    // post-rendering populated objects (this is a big of a kludge :( should be a separate resulting object out of the
    // rendering in order to have proper separation of concerns
    this.orgToVertex = []; // orgName -> vertex
    this.jobToVertex = []; // jobName -> vertex
};

Mioarchy.prototype =
{
    Types: {Job: 0, Application: 1, Contributor: 2, Role: 3, Organization: 4, Accountability: 5},

    // returns the # of immediate childen of the given organization (does not recurse)
    getOrganizationChildren: function (organization) {
        // loop through all orgs
        // if the org identifies having a parent with the same name as the specified org, we add it to the list of children of that org

        var children = [];
        var orgNames = Object.keys(this.organizations);

        for (var i = 0; i < orgNames.length; i++) {
            // the current org to check for being a parent
            var o = this.organizations[orgNames[i]];

            if (o.parent) {
                if (o.parent.toLowerCase() === organization.name.toLowerCase()) {
                    children.push(o);
                }
            }
        }
        return children;
    },
    getOrganizationJobs: function (organization, recurse) {
        var list = [];

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

        // jobs at sub levels
        if (recurse) {
            var children = this.getOrganizationChildren( organization );
            for (var i = 0; i < children.length; i++) {
                var childJobs = this.getOrganizationJobs(children[i], true);
                for (var j = 0; j < childJobs.length; j++) {
                    list.push(childJobs[j]);
                }
            }
        }
        return list;
    },
    isDescendantOfOrganization: function (testSubject, desiredParent) {
        if (testSubject.parent) {
            // is this the parent we are looking for?
            if (testSubject.parent.toLowerCase() === desiredParent.name.toLowerCase()) {
                return true; // yes, this is the parent, thus it's a descendant
            } else {
                // try looking to the parent's parent
                var parent = this.organizations[testSubject.parent];
                return this.isDescendantOfOrganization(parent, desiredParent);
            }
        } else {
            // this org has no parent
            return false;
        }
    },
    // returns the level # of this org
    getOrganizationLevel: function (organization) {
        if (organization.parent) {
            return 1 + this.getOrganizationLevel( this.organizations[organization.parent] );
        }
        return 1;
    },
    // returns the # of immediate childen of the given organization (does not recurse)
    getContributorJobs: function (organization) {
        // loop through all orgs
        // if the org identifies having a parent with the same name as the specified org, we add it to the list of children of that org

        var children = [];
        var orgNames = Object.keys(this.organizations);

        for (var i = 0; i < orgNames.length; i++) {
            // the current org to check for being a parent
            var o = this.organizations[orgNames[i]];

            if (o.parent) {
                if (o.parent.toLowerCase() === organization.name.toLowerCase()) {
                    children.push(o);
                }
            }
        }
        return children;
    },
    loadFromObject: function (obj) {
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
    },
    // returns an org traversal tree that notes which org node matches the application, with a list of matching jobs
    getApplicationSubordinatesTree: function ( applicationName, organizationName ) {
        var newNode = {children: [], matchingJobs: [], name: organizationName};
        // is this the application parent org?
        if (this.applications[applicationName].parentOrg === organizationName) {
            newNode.hasAccountabilities = true;
        } else {
            newNode.hasAccountabilities = this.applicationHasAccountabilitiesInOrganization(
                applicationName, organizationName);
        }

        // add matching jobs
        var org = this.organizations[organizationName];
        var jobs = this.getOrganizationJobs( org, false );
        for (var i = 0; i < jobs.length; i++) {
            var matches = this.applicationHasAccountabilitiesInJob( applicationName, jobs[i] );
            if (matches) {
                newNode.matchingJobs.push(jobs[i]);
            }
        }
        // for each child, attach the new subordinate tree
        // there is a case where multiple trees are returned
        var childOrgs = this.getOrganizationChildren( org );
        if (childOrgs && childOrgs.length > 0) {
            for (var i = 0; i < childOrgs.length; i++) {
                var tree = this.getApplicationSubordinatesTree( applicationName, childOrgs[i].name );
                if (tree) {
                    // there are subordinates in this branch, so add them to the new tree
                    newNode.children.push(tree);
                }
            }
        }
        return newNode;
    },
    applicationHasAccountabilitiesInOrganization: function (applicationName, organizationName) {
        var accountabilities = this.orgAccountabilities[organizationName];
        if (accountabilities) {
            for (var i = 0; i < accountabilities.length; i++) {
                if (accountabilities[i].application.toLowerCase() === applicationName.toLowerCase())
                {
                    return true;
                }
            }
        }
        return false;
    },
    applicationHasAccountabilitiesInJob: function (applicationName, jobId) {
        var accountabilities = this.jobAccountabilities[jobId];
        if (accountabilities) {
            for (var i = 0; i < accountabilities.length; i++) {
                if (accountabilities[i].application.toLowerCase() === applicationName.toLowerCase())
                {
                    return true;
                }
            }
        }
        return false;
    }
};

function Application(id, name, parentOrg, color) {
    this.type = Mioarchy.prototype.Types.Application;
    this.id = id;
    this.name = name;
    this.parentOrg = parentOrg;
    this.color = color;
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

function Accountability(id, appId, application, label, rating, accountabilityType) {
    this.type = Mioarchy.prototype.Types.Accountability;
    this.id = id;
    this.appId = appId;
    this.application = application;
    this.label = label;
    this.rating = rating;
    this.accountabilityType = accountabilityType;
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
        Accountability: Accountability
    };
}

