package com.miovision.Renderer;

import java.awt.*;

/**
 * Created by vleipnik on 2015-09-01.
 */
public class RenderInfoCircles extends RenderInfo
{
    protected Point[] circleCenters;

    public RenderInfoCircles(int numCircles, double minDistanceBetweenCircles, double circleDiameter, boolean useMiddle) {
        calculateCircleLocations(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle);
    }

    public Point[] circleCenters() {
        return circleCenters;
    }

    // Draws equally sized and spaced circles
    private void calculateCircleLocations(int numCircles, double minDistanceBetweenCircles, double circleDiameter,
                                          boolean useMiddle) {
        double dm = minDistanceBetweenCircles;
        double rc = circleDiameter / 2;
        int n = 0;
        int Nc = numCircles;
        int radiusIncrement = 1;
        int Nc_current = 0;
        int Nc_remaining = Nc;
        double x = 0;
        double y = 0;
        double R = 0;
        double alpha_min;
        double alpha;
        double minx = Double.MAX_VALUE;
        double miny = Double.MAX_VALUE;
        double maxx = Double.MIN_VALUE;
        double maxy = Double.MIN_VALUE;

        // base cases
        if (numCircles <= 0) {
            this.width = 0;
            this.height = 0;
            this.circleCenters = new Point[] { };
        }
        else if (numCircles == 1) {
            this.width = circleDiameter;
            this.height = circleDiameter;
            this.circleCenters = new Point[]{new Point(0, 0)};
        } else {
            this.circleCenters = new Point[numCircles];

            if (useMiddle) {
                // first circle is in the middle
                this.circleCenters[0] = new Point(0, 0);
                Nc_remaining--;
                n = 1;
            }

            while (Nc_remaining > 0) {
                // calculate current radius for this iteration
                R = radiusIncrement * (2 * rc + dm);

                // how many circles do we need to fit on the outer edge?
                alpha_min = 2 * Math.atan((rc + dm / 2) / R);

                // use remaining number of circles to see if they would all fit
                alpha = 2 * Math.PI / Nc_remaining;
                if (alpha < alpha_min) {
                    // we have too many circles - so just use alpha min to determine the number of circles
                    Nc_current = 1 + (int) Math.floor(2 * Math.PI / alpha_min);
                    alpha = 2 * Math.PI / Nc_current; // override alpha in case of error due to approximation used
                } else {
                    Nc_current = Nc_remaining;
                }

                // now draw the # of circles, given alpha
                for (int i = 0; i < Nc_current; i++) {
                    double angle = alpha * i;
                    double newX = x + R * Math.cos(angle);
                    double newY = y + R * Math.sin(angle);
                    Point p = new Point();
                    p.setLocation(newX, newY);
                    circleCenters[n++] = p;

                    // update boundaries, accounting for circle radius
                    maxx = Math.max(maxx, newX + rc);
                    maxy = Math.max(maxy, newY + rc);
                    minx = Math.min(minx, newX - rc);
                    miny = Math.min(miny, newY - rc);
                }

                // increase to next radius for next iteration
                radiusIncrement++;
                Nc_remaining -= Nc_current;
            }

            width = (R + rc) * 2;
            height = width;
        }
    }
}
