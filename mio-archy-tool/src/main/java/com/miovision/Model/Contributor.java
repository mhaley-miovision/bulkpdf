package com.miovision.Model;

/**
 * Created by vleipnik on 2015-08-31.
 */
public class Contributor extends MioarchyElement {
    private String firstName;
    private String lastName;

    public Contributor(int id, String firstName, String lastName, String name) {
        super(id, name);
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = name;
    }

    public String firstName() {
        return firstName;
    }
    public String lastName() {
        return lastName;
    }
    public String shortName() {
        return firstName.substring(0, 1) + lastName.substring(0, 1);
    }
}
