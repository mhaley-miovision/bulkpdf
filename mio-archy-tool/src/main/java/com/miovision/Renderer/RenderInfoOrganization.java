package com.miovision.Renderer;

import com.miovision.Model.Job;
import com.miovision.Model.Mioarchy;
import com.miovision.Model.Organization;
import com.mxgraph.view.mxGraph;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by vleipnik on 2015-09-01.
 */
public class RenderInfoOrganization extends RenderInfo {
    private Organization org;
    private Mioarchy mioarchy;
    private boolean isLeaf;
    private RenderInfoCircles currentOrgContributorCircles;
    private RenderInfoCircles subOrgCircles;
    private int numSubOrgCircles;
    private List<RenderInfoOrganization> children;
    private List<Job> jobsAtThisLevel;
    private double maxOrgCircleDiameter;

    // constants
    final double CIRCLE_DIAMETER = 40;
    final double MIN_DISTANCE_BETWEEN_CIRCLES = 40;

    public RenderInfoOrganization(Organization org, Mioarchy mioarchy) {
        this.org = org;
        this.children = new ArrayList<>();
        this.mioarchy = mioarchy;

        // retrieve child orgs
        List<Organization> childOrgs = mioarchy.getOrganizationChildren(org);

        // a leaf org is rendered differently than a parent org
        this.isLeaf = childOrgs.size() == 0;

        // get list of jobs
        this.jobsAtThisLevel = mioarchy.getOrganizationJobs(org, false);

        // does org have children?
        if (this.isLeaf) {
            // no, treat this as a group of contributors - assume circle rendering
            // generate circle info for this org (it is a LEAF!)
            this.currentOrgContributorCircles = new RenderInfoCircles(
                    jobsAtThisLevel.size(), MIN_DISTANCE_BETWEEN_CIRCLES, CIRCLE_DIAMETER, true);

            // circle
            this.width = calculateBoundingCircleDiameter(
                    this.currentOrgContributorCircles.width(),
                    this.currentOrgContributorCircles.height());
            this.height = width;

            maxOrgCircleDiameter = this.width; // not really used, just being diligent
        } else {
            // yes, and populate child org infos
            childOrgs.forEach(o -> this.children.add(new RenderInfoOrganization(o, mioarchy)));

            // next, take the remaining nodes and treat them as a circle (without having explicitly an org)
            this.currentOrgContributorCircles = new RenderInfoCircles(
                    jobsAtThisLevel.size(), MIN_DISTANCE_BETWEEN_CIRCLES, CIRCLE_DIAMETER, true);

            //next, treat each sub org as a circle, and determine position based on the LARGEST circle (equidistant)
            //draw a circle around each sub org with radius = width / 2

            // determine the radius of the new circle based on width and height of the biggest sub org
            this.children.forEach(ri -> {
                maxOrgCircleDiameter = Math.max(maxOrgCircleDiameter, ri.width());
                maxOrgCircleDiameter = Math.max(maxOrgCircleDiameter, ri.height());
            });
            // also include the fake circle
            maxOrgCircleDiameter = Math.max(maxOrgCircleDiameter, this.currentOrgContributorCircles.width());
            maxOrgCircleDiameter = Math.max(maxOrgCircleDiameter, this.currentOrgContributorCircles.height());

            // include the org without a circle as a fake org
            numSubOrgCircles = childOrgs.size();
            //numSubOrgCircles = jobsAtThisLevel.size() == 0 ? childOrgs.size() : childOrgs.size() + 1;

            // calculate circle rendering info as though the sub orgs were just circles
            this.subOrgCircles = new RenderInfoCircles(
                    numSubOrgCircles, MIN_DISTANCE_BETWEEN_CIRCLES, maxOrgCircleDiameter, false);

            // max dimensions determine by the sub org circle max dimensions
            this.width = this.subOrgCircles.width();
            this.height = this.subOrgCircles.height();
        }
    }
    /*
    if node has no orgs inside it, render it as a circle
    second, render each sub-org, and get a size back
    remaining nodes in the org should be rendered as a mini circle, with size back
    now we have the sub orgs and fake sub org calculated
    next, treat each sub org as a circle, and determine position based on the LARGEST circle (equidistant)
    draw a circle around each sub org with radius = width / 2
    actually rendering based on render info applies rendering rules
     */
    public void render(double x, double y, mxGraph graph) {
        Point[] circleLocations;

        if (isLeaf) {
            // translate to 0,0
            Point d = getXYOffsetFromPoints(currentOrgContributorCircles.circleCenters());
            // account for differences in circle sizes
            double w = (this.width - currentOrgContributorCircles.width()) / 2;
            double h = (this.height - currentOrgContributorCircles.height()) / 2;
            // now account for containing circle center
            double dx = x - d.x + w;
            double dy = y - d.y + h;

            // now move all the circle locations as needed
            circleLocations = translatePoints(currentOrgContributorCircles.circleCenters(), dx, dy);

            // render jobs (circles)
            for (int i = 0; i < jobsAtThisLevel.size(); i++) {
                String defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none";
                String color = determineContributorColor(jobsAtThisLevel.get(i), mioarchy);
                double defaultWidth = CIRCLE_DIAMETER;
                double defaultHeight = CIRCLE_DIAMETER;
                double cx = circleLocations[i].x;
                double cy = circleLocations[i].y;

                String label;
                if (jobsAtThisLevel.get(i).employee() != null) {
                    label = jobsAtThisLevel.get(i).employee().shortName().toLowerCase();
                } else {
                    label = "NEW"; // not yet hired
                }

                // actually "draw" :)
                graph.getModel().beginUpdate();
                try {
                    Object parent = graph.getDefaultParent();
                    graph.insertVertex(parent, null, label, cx, cy, defaultWidth, defaultHeight, defaultStyle +
                            ";gradientColor=" + color);
                } finally {
                    graph.getModel().endUpdate();
                }

                // now we will draw a circle around our org
                graph.getModel().beginUpdate();
                try {
                    Object parent = graph.getDefaultParent();
                    String orgLabel = org.name();
                    graph.insertVertex(parent, null, orgLabel, x, y, this.width, this.height,
                            "shape=ellipse;fillColor=none;whiteSpace=wrap;fillColor=none;" +
                                    "abelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                } finally {
                    graph.getModel().endUpdate();
                }
            }

        } else {
            // note that this is an organization that has other organizations but also child jobs at this level
            boolean isParentOrgWithJobs = jobsAtThisLevel.size() > 0;

            // translate to 0,0
            Point d = getXYOffsetFromPoints(currentOrgContributorCircles.circleCenters());
            // now account for containing circle center, using the org sub circles as reference
            //TODO: this might be causing the offset problem for DES which has a smaller circle
            double dx = x - d.x + (this.width - this.subOrgCircles.width()) / 2;
            double dy = y - d.y + (this.height - this.subOrgCircles.height()) / 2;
            circleLocations = translatePoints(subOrgCircles.circleCenters(), dx, dy);

            // render organizations (circles)
            for (int i = 0; i < this.children.size(); i++) {
                // current org rendering info
                RenderInfoOrganization orgRenderInfo = this.children.get(i);
                String orgLabel = orgRenderInfo.org.name();

                graph.getModel().beginUpdate();
                try {
                    Object parent = graph.getDefaultParent();
                    graph.insertVertex(parent, null, orgLabel, circleLocations[i].x, circleLocations[i].y,
                            orgRenderInfo.width, orgRenderInfo.height,
                            "shape=ellipse;fillColor=none;whiteSpace=wrap;fillColor=none;" +
                            "abelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                } finally {
                    graph.getModel().endUpdate();
                }

                // render organization internals
                orgRenderInfo.render(circleLocations[i].x, circleLocations[i].y, graph);
            }

            /*
            // now render the jobs at this level

            // translate to 0,0
            Point d = getXYOffsetFromPoints(currentOrgContributorCircles.circleCenters);

            double w = (this.width - currentOrgContributorCircles.width()) / 2;
            double h = (this.height - currentOrgContributorCircles.height()) / 2;
            if (isParentOrgWithJobs) {
                w = 0;
                h = 0;
            }

            // now account for containing circle center
            double dx = x - d.x + w;
            double dy = y - d.y + h;

            // if this the fake circle, we have to offset to account for the location the fake circle
            // this will be the very last circle in the list

            Point fakeCircleCenter = this.subOrgCircles.circleCenters[this.subOrgCircles.circleCenters.length - 1];
            dx += fakeCircleCenter.getX();
            dy += fakeCircleCenter.getY();

            // now move all the circle locations as needed
            Point[] circleLocations = translatePoints(currentOrgContributorCircles.circleCenters, dx, dy);

            // render jobs (circles)
            for (int i = 0; i < jobsAtThisLevel.size(); i++) {
                String defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none";
                String color = determineContributorColor(jobsAtThisLevel.get(i), mioarchy);
                double defaultWidth = CIRCLE_DIAMETER;
                double defaultHeight = CIRCLE_DIAMETER;
                double cx = circleLocations[i].x;
                double cy = circleLocations[i].y;

                String label;
                if (jobsAtThisLevel.get(i).employee() != null) {
                    label = jobsAtThisLevel.get(i).employee().shortName().toLowerCase();
                } else {
                    label = "NEW"; // not yet hired
                }

                // actually "draw" :)
                graph.getModel().beginUpdate();
                try {
                    Object parent = graph.getDefaultParent();
                    graph.insertVertex(parent, null, label, cx, cy, defaultWidth, defaultHeight, defaultStyle +
                            ";gradientColor=" + color);
                } finally {
                    graph.getModel().endUpdate();
                }
            }
            */
        }
    }

    private String determineContributorColor(Job c, Mioarchy mioarchy)
    {
        String colorString = "";

        // this is a lead
        if (c.role().name().toLowerCase().indexOf("lead") >= 0) {
            colorString += "dark";
        }

        // by app now
        if (c.application() != null) {
            if (c.application().name().toLowerCase().indexOf("product") >= 0) {
                colorString = "green";
            } else if (c.application().name().toLowerCase().indexOf("strategic") >= 0) {
                colorString = "red";
            } else if (c.application().name().toLowerCase().indexOf("innovation") >= 0) {
                colorString = "gray";
            } else if (c.application().name().toLowerCase().indexOf("organizational development") >= 0) {
                colorString = "yellow";
            } else if (c.application().name().toLowerCase().indexOf("culture committee") >= 0) {
                colorString = "pink";
            } else if (c.application().name().toLowerCase().indexOf("quality control") >= 0) {
                colorString = "magenta";
            }
        } else {
            // try by organization
            if (c.organization() != null) {
                if (mioarchy.isDescendantOfOrganization(c.organization(), mioarchy.organizationByName("Engineering"))) {
                    colorString = "purple";
                } else if (mioarchy.isDescendantOfOrganization(c.organization(), mioarchy.organizationByName("Finance"))) {
                    colorString = "orange";
                } else if (mioarchy.isDescendantOfOrganization(c.organization(), mioarchy.organizationByName("Operations"))) {
                    colorString = "blue";
                }
            } else {
                colorString = "white";
            }
        }
        return colorString;
    }

    // Moves a list of points by dx,dy
    private Point[] translatePoints(Point[] points, double dx, double dy) {
        Point[] pointsTranslated = new Point[points.length];
        for (int i = 0; i < points.length; i++) {
            pointsTranslated[i] = new Point();
            pointsTranslated[i].setLocation(points[i].getX() + dx, points[i].getY() + dy);
        }
        return pointsTranslated;
    }

    private double calculateBoundingCircleDiameter(double width, double height) {
        return Math.sqrt(width*width + height*height);
    }

    // TODO: this ignores circle radius -- this could be causing positioning errors i've been seeing
    private Point getXYOffsetFromPoints(Point[] points) {
        double x = Double.MAX_VALUE;
        double y = Double.MAX_VALUE;
        for (int i = 0; i < points.length; i++) {
            x = Math.min(x, points[i].x);
            y = Math.min(y, points[i].y);
        }
        Point p = new Point();
        p.setLocation(x, y);
        return p;
    }
}
