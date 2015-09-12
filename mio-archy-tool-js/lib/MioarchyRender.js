function RenderInfoCircles(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle)
{
    this.circleCenters = {};
    this.calculateCircleLocations(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle);
}

RenderInfoCircles.prototype = {
    // Draws equally sized and spaced circles
    calculateCircleLocations: function(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle) {
        var dm = minDistanceBetweenCircles;
        var rc = circleDiameter / 2;
        var n = 0;
        var Nc = numCircles;
        var radiusIncrement = 1;
        var Nc_current = 0;
        var Nc_remaining = Nc;
        var x = 0;
        var y = 0;
        var R = 0;
        var alpha_min;
        var alpha;
        var minx = Double.MAX_VALUE;
        var miny = Double.MAX_VALUE;
        var maxx = Double.MIN_VALUE;
        var maxy = Double.MIN_VALUE;

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

function RenderInfoOrganization(org, mioarchy) 
{
    // constants
    this.CIRCLE_DIAMETER = 40;
    this.MIN_DISTANCE_BETWEEN_CIRCLES = 40;

    this.org = org;
    this.children = [];
    this.mioarchy = mioarchy;

    // retrieve child orgs
    var childOrgs = mioarchy.getOrganizationChildren(org);

    // a leaf org is rendered differently than a parent org
    this.isLeaf = childOrgs.length == 0;

    // get list of jobs
    this.jobsAtThisLevel = mioarchy.getOrganizationJobs(org, false);

    // does org have children?
    if (this.isLeaf) {
        // no, treat this as a group of contributors - assume circle rendering
        // generate circle info for this org (it is a LEAF!)
        this.currentOrgContributorCircles = new RenderInfoCircles(
            jobsAtThisLevel.length, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, true);

        // circle
        this.width = calculateBoundingCircleDiameter(
            this.currentOrgContributorCircles.width, this.currentOrgContributorCircles.height;
        this.height = width;

        maxOrgCircleDiameter = this.width; // not really used, just being diligent
    } else {
        // yes, and populate child org infos
        childOrgs.forEach(o -> this.children.add( new RenderInfoOrganization(o, mioarchy) ));

        // next, take the remaining nodes and treat them as a circle (without having explicitly an org)
        this.currentOrgContributorCircles = new RenderInfoCircles(
                jobsAtThisLevel.length, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, true);

        //next, treat each sub org as a circle, and determine position based on the LARGEST circle (equidistant)
        //draw a circle around each sub org with radius = width / 2

        // determine the radius of the new circle based on width and height of the biggest sub org
        this.children.forEach(ri -> {
            maxOrgCircleDiameter = Math.max( maxOrgCircleDiameter, ri.width ;
            maxOrgCircleDiameter = Math.max( maxOrgCircleDiameter, ri.height ;
        });
        // also include the fake circle
        maxOrgCircleDiameter = Math.max( maxOrgCircleDiameter, this.currentOrgContributorCircles.width ;
        maxOrgCircleDiameter = Math.max( maxOrgCircleDiameter, this.currentOrgContributorCircles.height ;

        // include the org without a circle as a fake org
        numSubOrgCircles = childOrgs.length;
        //numSubOrgCircles = jobsAtThisLevel.length == 0 ? childOrgs.length : childOrgs.length + 1;

        // calculate circle rendering info as though the sub orgs were just circles
        this.subOrgCircles = new RenderInfoCircles(
                numSubOrgCircles, this.MIN_DISTANCE_BETWEEN_CIRCLES, maxOrgCircleDiameter, false);

        // max dimensions determine by the sub org circle max dimensions
        this.width = this.subOrgCircles.width;
        this.height = this.subOrgCircles.height;
    }
}

RenderInfoOrganization.prototype = 
{
    /*
    if node has no orgs inside it, render it as a circle
    second, render each sub-org, and get a size back
    remaining nodes in the org should be rendered as a mini circle, with size back
    now we have the sub orgs and fake sub org calculated
    next, treat each sub org as a circle, and determine position based on the LARGEST circle (equidistant)
    draw a circle around each sub org with radius = width / 2
    actually rendering based on render info applies rendering rules
     */
    render: function(x, y, graph) {
        var circleLocations;

        if (this.isLeaf) {
            // translate to 0,0
            var d = getXYOffsetFromPoints( currentOrgContributorCircles.circleCenters );

            // account for differences in circle sizes
            var w = (this.width - currentOrgContributorCircles.width / 2;
            var h = (this.height - currentOrgContributorCircles.height / 2;

            // now account for containing circle center
            var dx = x - d.x + w;
            var dy = y - d.y + h;

            // now move all the circle locations as needed
            circleLocations = translatePoints( currentOrgContributorCircles.circleCenters, dx, dy );

            // render jobs (circles)
            for (j in jobsAtThisLevel) {

                var defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none";
                var color = determineContributorColor( j, mioarchy );
                var defaultWidth = this.CIRCLE_DIAMETER;
                var defaultHeight = this.CIRCLE_DIAMETER;
                var cx = circleLocations[i].x;
                var cy = circleLocations[i].y;

                String label;
                if ( j.contributor != null) {
                    label = j.contributor.name; //hortName.toLowerCase();
                } else {
                    label = "NEW"; // not yet hired
                }

                // actually "draw" :)
                graph.getModel().beginUpdate();
                try {
                    var parent = graph.getDefaultParent();
                    graph.insertVertex(parent, null, label, cx, cy, defaultWidth, defaultHeight, defaultStyle + ";gradientColor=" + color);
                } finally {
                    graph.getModel().endUpdate();
                }

                // now we will draw a circle around our org
                graph.getModel().beginUpdate();
                try {
                    var parent = graph.getDefaultParent();
                    var orgLabel = org.name();
                    graph.insertVertex(parent, null, orgLabel, x, y, this.width, this.height,
                            "shape=ellipse;fillColor=none;whiteSpace=wrap;fillColor=none;" +
                            "abelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                } finally {
                    graph.getModel().endUpdate();
                }
            }

        } else {
            // note that this is an organization that has other organizations but also child jobs at this level
            boolean isParentOrgWithJobs = jobsAtThisLevel.length > 0;

            // translate to 0,0
            var d = getXYOffsetFromPoints( currentOrgContributorCircles.circleCenters );
            // now account for containing circle center, using the org sub circles as reference
            //TODO: this might be causing the offset problem for DES which has a smaller circle
            var dx = x - d.x + (this.width - this.subOrgCircles.width()) / 2;
            var dy = y - d.y + (this.height - this.subOrgCircles.height()) / 2;
            circleLocations = translatePoints(subOrgCircles.circleCenters, dx, dy);

            // render organizations (circles)
            for (int i = 0; i < this.children.length; i++ ) {
                // current org rendering info
                var orgRenderInfo = this.children.get(i);
                var orgLabel = orgRenderInfo.org.name;

                graph.getModel().beginUpdate();
                try {
                    Object parent = graph.getDefaultParent();
                    graph.insertVertex(
                            parent, null, orgLabel, 
                            circleLocations[i].x, circleLocations[i].y, orgRenderInfo.width, orgRenderInfo.height,
                            "shape=ellipse;fillColor=none;whiteSpace=wrap;fillColor=none;" +
                            "abelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                } finally {
                    graph.getModel().endUpdate();
                }

                // render organization internals
                orgRenderInfo.render( circleLocations[i].x, circleLocations[i].y, graph );
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
    },

    determineContributorColor: function(Job c, Mioarchy mioarchy)
    {
        var colorString = "";

        // this is a lead
        if (c.role.name.toLowerCase().indexOf("lead") >= 0) {
            colorString += "dark";
        }

        var app = mioarchy.applications[c.application];

        // by app now
        if (c.application != null) {
            var appName = app.name.toLowerCase();

            if (appName.indexOf("product") >= 0) {
                colorString = "green";
            } else if (appName.toLowerCase().indexOf("strategic") >= 0) {
                colorString = "red";
            } else if (appName.toLowerCase().indexOf("innovation") >= 0) {
                colorString = "gray";
            } else if (appName.toLowerCase().indexOf("organizational development") >= 0) {
                colorString = "yellow";
            } else if (appName.toLowerCase().indexOf("culture committee") >= 0) {
                colorString = "pink";
            } else if (appName.toLowerCase().indexOf("quality control") >= 0) {
                colorString = "magenta";
            }
        } else {
            // try by organization
            if (c.organization != null) {
                if (mioarchy.isDescendantOfOrganization(c.organization, mioarchy.organizations["Engineering"])) {
                    colorString = "purple";
                } else if (mioarchy.isDescendantOfOrganization(c.organization, mioarchy.organizations["Finance"])) {
                    colorString = "orange";
                } else if (mioarchy.isDescendantOfOrganization(c.organization, mioarchy.organizations["Operations"])) {
                    colorString = "blue";
                }
            } else {
                colorString = "white";
            }
        }
        return colorString;
    },

    // Moves a list of points by dx,dy
    translatePoints: function(points, dx, dy) {
        var pointsTranslated = {};
        for (p in points)
            pointsTranslated.push({ x: p.x + dx, y: p.y + dy });
        }
        return pointsTranslated;
    },

    calculateBoundingCircleDiameter: function(width, height) {
        return Math.sqrt( width*width + height*height );
    },

    // TODO: this ignores circle radius -- this could be causing positioning errors i've been seeing
    getXYOffsetFromPoints: function(points) {
        var x = Double.MAX_VALUE;
        var y = Double.MAX_VALUE;
        for (p in points)
            x = Math.min(x, p.x);
            y = Math.min(y, p.y);
        }
        return { x: x, y: y };
    }
}