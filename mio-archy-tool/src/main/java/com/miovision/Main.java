package com.miovision;

import com.miovision.Model.Mioarchy;
import com.miovision.Reader.MioarchyReader;
import com.miovision.Renderer.MioarchyRenderer;


public class Main {
    public static void main(String[] args) throws Exception {
        // read mioarchy
        MioarchyReader reader = new MioarchyReader();
        long t0 = System.currentTimeMillis();
        Mioarchy mioarchy = reader.readMioarchy();
        System.out.println("Read mioarchy in " + (System.currentTimeMillis() - t0)/1000 + " seconds.");

        // render mioarchy
        MioarchyRenderer renderer = new MioarchyRenderer();
        renderer.test(mioarchy);
    }
}
