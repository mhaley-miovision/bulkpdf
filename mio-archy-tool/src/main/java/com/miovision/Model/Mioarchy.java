package com.miovision.Model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by vleipnik on 2015-09-01.
 */
public class Mioarchy {
    // lists
    private List<Job> jobs;

    // maps
    private HashMap<String, Organization> organizationsByName;
    private HashMap<String, Job> jobsByName;
    private HashMap<String, Contributor> contributorsByName;
    private HashMap<String, Application> applicationsByName;
    private HashMap<String, Role> rolesByName;

    public Mioarchy(List<Job> jobs,
                    HashMap<String, Organization> organizationsByName,
                    HashMap<String, Job> jobsByName,
                    HashMap<String, Contributor> contributorsByName,
                    HashMap<String, Application> applicationsByName,
                    HashMap<String, Role> rolesByName) {
        this.jobs = jobs;
        this.applicationsByName = applicationsByName;
        this.contributorsByName = contributorsByName;
        this.rolesByName = rolesByName;
        this.jobsByName = jobsByName;
        this.organizationsByName = organizationsByName;
    }

    public Organization[] organizationsByName() {
        Organization[] organizationsArray = new Organization[organizationsByName.size()];
        return organizationsByName.values().toArray(organizationsArray);
    }

    public Job[] contributorsByName() {
        Job[] contributorsArray = new Job[jobsByName.size()];
        return jobsByName.values().toArray(contributorsArray);
    }

    public Contributor[] employeesByName() {
        Contributor[] employeesArray = new Contributor[contributorsByName.size()];
        return contributorsByName.values().toArray(employeesArray);
    }

    public Application[] applicationsByName() {
        Application[] applicationsArray = new Application[applicationsByName.size()];
        return applicationsByName.values().toArray(applicationsArray);
    }

    public Role[] rolesByName() {
        Role[] rolesArray = new Role[rolesByName.size()];
        return rolesByName.values().toArray(rolesArray);
    }

    public Application applicationByName(String name) {
        return applicationsByName.get(name);
    }
    public Contributor contributorByName(String name) {
        return contributorsByName.get(name);
    }
    public Role roleByName(String name) {
        return rolesByName.get(name);
    }
    public Job jobByName(String name) {
        return jobsByName.get(name);
    }
    public Organization organizationByName(String name) {
        return organizationsByName.get(name);
    }

    public List<Organization> getOrganizationChildren(Organization organization) {
        List<Organization> children = new ArrayList<>();
        for (Organization o : organizationsByName.values()) {
            // equality judged on name
            if (o.parent() != null) {
                if (o.parent().name().equalsIgnoreCase(organization.name())) {
                    children.add(o);
                }
            }
        }
        return children;
    }

    public List<Job> getOrganizationJobs(Organization organization, boolean recurse) {
        List<Job> list = new ArrayList<>();
        // jobs at sub levels
        if (recurse) {
            for (Organization o : getOrganizationChildren(organization)) {
                list.addAll(getOrganizationJobs(o, true));
            }
        }
        // jobs at this level
        for (Job c : jobs) {
            if (c.organization() != null) {
                if (c.organization().name().equalsIgnoreCase(organization.name())) {
                    list.add(c);
                }
            }
        }
        return list;
    }

    public boolean isDescendantOfOrganization(Organization testSubject, Organization desiredParent) {
        if (testSubject.parent() == null || testSubject.parent().name() == null || desiredParent == null || desiredParent.name() == null)
            return false;
        if (testSubject.parent().name().equalsIgnoreCase(desiredParent.name()))
            return true;
        return isDescendantOfOrganization(testSubject.parent(), desiredParent);
    }
}