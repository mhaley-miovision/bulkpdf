package com.miovision.Model;

import java.util.HashMap;
import java.util.List;

/**
 * Created by vleipnik on 2015-09-01.
 */
public abstract class MioarchyElement {
    protected int id;
    protected String name;

    public MioarchyElement(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public String name() {
        return name;
    }
    public int id() {
        return id;
    }

    public static <T extends MioarchyElement> HashMap<String, T> createHashMapForSearchingByName(List<T> list) {
        HashMap<String, T> map = new HashMap<>();
        for (T elt: list) {
            if (elt.name() != null) {
                map.put(elt.name(), elt);
            }
        }
        return map;
    }
}
