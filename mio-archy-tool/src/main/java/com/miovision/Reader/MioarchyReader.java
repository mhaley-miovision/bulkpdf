package com.miovision.Reader;

import com.google.gdata.client.spreadsheet.*;
import com.google.gdata.data.spreadsheet.*;
import com.google.gdata.util.*;

import java.io.IOException;
import java.net.*;
import java.util.*;

import com.miovision.Model.*;

/**
 * Created by vleipnik on 2015-08-31.
 */
public class MioarchyReader
{
    public Mioarchy readMioarchy()
            throws IOException, ServiceException {

        System.out.println("Reading Mioarchy...");

        String applicationName = "AppName";
        //String key = "1c6uEwZAiKcND_5HCYb-YwEdhz6MakRo0Ae8aqbwh9UA";
        String key = "1hsCRYiuW9UquI1uQBsAc6fMfEnQYCjeE716h8FwAdaQ";

        SpreadsheetService service = new SpreadsheetService(applicationName);
        URL url = FeedURLFactory.getDefault().getWorksheetFeedUrl(key, "public", "values");
        WorksheetFeed feed = service.getFeed(url, WorksheetFeed.class);
        List<WorksheetEntry> worksheetList = feed.getEntries();

        // first read the organizations
        final String ORGS_SHEET = "Organizations";
        HashMap<String, Organization> orgs = null;
        for (WorksheetEntry worksheetEntry : worksheetList) {
            String title = worksheetEntry.getTitle().getPlainText();
            if (title.equalsIgnoreCase(ORGS_SHEET)) {
                orgs = retrieveOrganizations(service, worksheetEntry);
            }
        }

        // now read applications
        final String APPS_SHEET = "Applications";
        HashMap<String, Application> apps = null;
        for (WorksheetEntry worksheetEntry : worksheetList) {
            String title = worksheetEntry.getTitle().getPlainText();
            if (title.equalsIgnoreCase(APPS_SHEET)) {
                apps = retrieveApplications(service, worksheetEntry, orgs);
            }
        }

        // next read roles
        final String ROLES_SHEET = "Roles";
        HashMap<String, Role> roles = null;
        for (WorksheetEntry worksheetEntry : worksheetList) {
            String title = worksheetEntry.getTitle().getPlainText();
            if (title.equalsIgnoreCase(ROLES_SHEET)) {
                roles = retrieveRoles(service, worksheetEntry, apps);
            }
        }

        // next read contributors
        final String CONTRIBUTORS_SHEET = "Contributors";
        HashMap<String, Contributor> contributors = null;
        for (WorksheetEntry worksheetEntry : worksheetList) {
            String title = worksheetEntry.getTitle().getPlainText();
            if (title.equalsIgnoreCase(CONTRIBUTORS_SHEET)) {
                contributors = retrieveContributors(service, worksheetEntry);
            }
        }

        // next read jobs
        final String JOBS_SHEET = "Jobs";
       List<Job> jobs = null;
        for (WorksheetEntry worksheetEntry : worksheetList) {
            String title = worksheetEntry.getTitle().getPlainText();
            if (title.equalsIgnoreCase(JOBS_SHEET)) {
                jobs = retrieveJobs(service, worksheetEntry, contributors, orgs, apps, roles);
            }
        }

        return new Mioarchy(jobs, orgs, MioarchyElement.createHashMapForSearchingByName(jobs), contributors, apps, roles);
    }

    private HashMap<String, Organization> retrieveOrganizations(SpreadsheetService service, WorksheetEntry worksheetEntry) throws IOException, ServiceException {
        ListQuery listQuery = new ListQuery(worksheetEntry.getListFeedUrl());
        ListFeed listFeed = service.query(listQuery, ListFeed.class);
        List<ListEntry> list = listFeed.getEntries();
        HashMap<String, Organization> orgs = new HashMap<>();

        // two pass to build linkages:
        // 1) read and create concrete org instances
        //    collect child lists
        // 2) link parents in concrete instances
        //    link children in concrete instances
        list.forEach(row -> {
            int id = Integer.parseInt(row.getTitle().getPlainText());
            String name = row.getCustomElements().getValue("organization");
            String parent = row.getCustomElements().getValue("parent");
            Organization org = new Organization(id, name, null);
            orgs.put(name, org);
        });
        list.forEach(row -> {
            String name = row.getCustomElements().getValue("organization");
            String parent = row.getCustomElements().getValue("parent");
            Organization parentOrg = orgs.get(parent);
            orgs.get(name).attachToParent(parentOrg);
        });
        return orgs;
    }

    private HashMap<String, Application> retrieveApplications(SpreadsheetService service, WorksheetEntry worksheetEntry,
                                       HashMap<String, Organization> orgs) throws IOException, ServiceException {
        ListQuery listQuery = new ListQuery(worksheetEntry.getListFeedUrl());
        ListFeed listFeed = service.query(listQuery, ListFeed.class);
        List<ListEntry> list = listFeed.getEntries();
        HashMap<String, Application> apps = new HashMap<>();

        list.forEach(row -> {
            int id = Integer.parseInt(row.getTitle().getPlainText());
            String name = row.getCustomElements().getValue("application");
            String organization = row.getCustomElements().getValue("organization");
            Organization org = orgs.get(organization);
            Application app = new Application(id, name, org);
            apps.put(name, app);
        });
        return apps;
    }

    private HashMap<String, Role> retrieveRoles(SpreadsheetService service, WorksheetEntry worksheetEntry,
                                                HashMap<String, Application> apps)
            throws IOException, ServiceException {
        ListQuery listQuery = new ListQuery(worksheetEntry.getListFeedUrl());
        ListFeed listFeed = service.query(listQuery, ListFeed.class);
        List<ListEntry> list = listFeed.getEntries();
        HashMap<String, Role> roles = new HashMap<>();

        list.forEach(row -> {
            int id = Integer.parseInt(row.getTitle().getPlainText());
            String name = row.getCustomElements().getValue("role");
            Role role = new Role(id, name);
            roles.put(name, role);
        });
        return roles;
    }

    private HashMap<String, Contributor> retrieveContributors(SpreadsheetService service, WorksheetEntry worksheetEntry)
            throws IOException, ServiceException {
        ListQuery listQuery = new ListQuery(worksheetEntry.getListFeedUrl());
        ListFeed listFeed = service.query(listQuery, ListFeed.class);
        List<ListEntry> list = listFeed.getEntries();
        HashMap<String, Contributor> employees = new HashMap<>();

        list.forEach(row -> {
            int id = Integer.parseInt(row.getTitle().getPlainText());
            String firstName = row.getCustomElements().getValue("firstName");
            String lastName = row.getCustomElements().getValue("lastName");
            String name = row.getCustomElements().getValue("name");
            Contributor contributor = new Contributor(id, firstName, lastName, name);
            employees.put(name, contributor);
        });
        return employees;
    }

    private List<Job> retrieveJobs(SpreadsheetService service,
                                           WorksheetEntry worksheetEntry,
                                           HashMap<String, Contributor> contributors,
                                           HashMap<String, Organization> orgs,
                                           HashMap<String, Application> apps,
                                           HashMap<String, Role> roles)
            throws IOException, ServiceException {

        ListQuery listQuery = new ListQuery(worksheetEntry.getListFeedUrl());
        ListFeed listFeed = service.query(listQuery, ListFeed.class);
        List<ListEntry> list = listFeed.getEntries();
        List<Job> jobs = new ArrayList<>();

        list.forEach(row -> {
            int id = Integer.parseInt(row.getTitle().getPlainText());
            String accountabilityLabel = row.getCustomElements().getValue("accountabilitylabel");
            String accountabilityLevel = row.getCustomElements().getValue("accountabilitylevel");
            String app = row.getCustomElements().getValue("application");
            String org = row.getCustomElements().getValue("organization");
            String name = row.getCustomElements().getValue("contributor");
            String role = row.getCustomElements().getValue("role");
            Job job = new Job(
                    id,
                    contributors.get(name),
                    orgs.get(org),
                    roles.get(role),
                    apps.get(app),
                    accountabilityLabel,
                    accountabilityLevel
            );
            jobs.add(job);
        });
        return jobs;
    }
}
