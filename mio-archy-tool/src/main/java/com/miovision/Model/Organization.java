package com.miovision.Model;

/**
 * Created by vleipnik on 2015-08-31.
 */
public class Organization extends MioarchyElement {
    private Organization parent;

    public Organization(int id, String name, Organization parent) {
        super(id, name);
        this.parent = parent;
    }

    public void attachToParent(Organization parent) {
        this.parent = parent;
    }
    public int id() {
        return id;
    }
    public String name() {
        return name;
    }
    public Organization parent() {
        return parent;
    }
}