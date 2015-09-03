package com.miovision.Model;

/**
 * Created by vleipnik on 2015-08-31.
 */
public class Job extends MioarchyElement {
    private Contributor contributor;
    private Organization organization;
    private Role role;
    private Application application;
    private String accountabilityLabel;
    private String accountabilityLevel;

    public Job(int id, Contributor contributor, Organization organization, Role role, Application application,
               String accountabilityLabel, String accountabilityLevel)
    {
        super(id, contributor != null ? contributor.name() : null);

        //TODO: add construction checks
        this.id = id;
        this.contributor = contributor;
        this.organization = organization;
        this.role = role;
        this.application = application;
        this.accountabilityLabel = accountabilityLabel;
        this.accountabilityLevel = accountabilityLevel;
    }

    public Contributor employee() { return contributor; }
    public Organization organization() {
        return organization;
    }
    public Application application() {
        return application;
    }
    public Role role() {
        return role;
    }
    public String accountabilityLabel() { return accountabilityLabel; }
    public String accountabilityLevel() { return accountabilityLevel; }
}
