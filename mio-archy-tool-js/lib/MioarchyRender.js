'use strict';

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
        var minx = Number.MAX_VALUE;
        var miny = Number.MAX_VALUE;
        var maxx = Number.MIN_VALUE;
        var maxy = Number.MIN_VALUE;

        // base cases
        if (numCircles <= 0) {
            this.width = 0;
            this.height = 0;
            this.circleCenters = [ { } ];
        }
        else if (numCircles == 1) {
            this.width = circleDiameter;
            this.height = circleDiameter;
            this.circleCenters = [ { x:0, y:0 } ];
        } else {
            this.circleCenters = [];

            if (useMiddle) {
                // first circle is in the middle
                this.circleCenters[0] = { x:0, y:0 };
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
                    Nc_current = 1 + Math.floor( 2 * Math.PI / alpha_min );
                    alpha = 2 * Math.PI / Nc_current; // override alpha in case of error due to approximation used
                } else {
                    Nc_current = Nc_remaining;
                }

                // now draw the # of circles, given alpha
                for (var i = 0; i < Nc_current; i++) {
                    var angle = alpha * i;
                    var newX = x + R * Math.cos(angle);
                    var newY = y + R * Math.sin(angle);
                    var p = { x: newX, y: newY };
                    this.circleCenters[n++] = p;

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
            this.width = (R + rc) * 2;
            this.height = this.width;
        }
    }
}

function RenderInfoOrganization(org, mioarchy) 
{
    console.log("===================================");
    console.log("RenderInfoOrganization - Contructor");

    // constants
    this.CIRCLE_DIAMETER = 40;
    this.MIN_DISTANCE_BETWEEN_CIRCLES = 40;

    this.org = org;
    this.children = [];
    this.mioarchy = mioarchy;

    // retrieve child orgs
    this.childOrgs = mioarchy.getOrganizationChildren( org );

    // a leaf org is rendered differently than a parent org
    this.isLeaf = this.childOrgs.length == 0;

    // get list of jobs
    this.jobsAtThisLevel = mioarchy.getOrganizationJobs( org, false );

    // does org have children?
    if (this.isLeaf) {
        // no, treat this as a group of contributors - assume circle rendering
        // generate circle info for this org (it is a LEAF!)
        this.currentOrgContributorCircles = new RenderInfoCircles(
            this.jobsAtThisLevel.length, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, true);

        // circle
        console.log(this.currentOrgContributorCircles);
        this.width = this.calculateBoundingCircleDiameter( this.currentOrgContributorCircles.width, this.currentOrgContributorCircles.height );
        this.height = this.width;

        this.maxOrgCircleDiameter = this.width; // not really used, just being diligent
    } else {
        // yes, and populate child org infos
        for (o in this.childOrgs) {
            this.children.push( new RenderInfoOrganization( this.childOrgs[o], mioarchy ) );
        }

        // next, take the remaining nodes and treat them as a circle (without having explicitly an org)
        this.currentOrgContributorCircles = new RenderInfoCircles(
                this.jobsAtThisLevel.length, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, true);

        //next, treat each sub org as a circle, and determine position based on the LARGEST circle (equidistant)
        //draw a circle around each sub org with radius = width / 2

        // determine the radius of the new circle based on width and height of the biggest sub org
        for (ri in this.children) {
            this.maxOrgCircleDiameter = Math.max( this.maxOrgCircleDiameter, ri.width );
            this.maxOrgCircleDiameter = Math.max( this.maxOrgCircleDiameter, ri.height );
        }

        // also include the fake circle
        this.maxOrgCircleDiameter = Math.max( this.maxOrgCircleDiameter, this.currentOrgContributorCircles.width );
        this.maxOrgCircleDiameter = Math.max( this.maxOrgCircleDiameter, this.currentOrgContributorCircles.height );

        // include the org without a circle as a fake org
        numSubOrgCircles = this.childOrgs.length;
        //numSubOrgCircles = jobsAtThisLevel.length == 0 ? this.childOrgs.length : this.childOrgs.length + 1;

        // calculate circle rendering info as though the sub orgs were just circles
        this.subOrgCircles = new RenderInfoCircles( numSubOrgCircles, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.maxOrgCircleDiameter, false );

        // max dimensions determine by the sub org circle max dimensions
        this.width = this.subOrgCircles.width;
        this.height = this.subOrgCircles.height;
    }


    console.log(this);
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
            var d = this.getXYOffsetFromPoints( this.currentOrgContributorCircles.circleCenters );

            console.log(this);

            // account for differences in circle sizes
            var w = this.width - this.currentOrgContributorCircles.width / 2;
            var h = this.height - this.currentOrgContributorCircles.height / 2;

            // now account for containing circle center
            var dx = x - d.x + w;
            var dy = y - d.y + h;

            // now move all the circle locations as needed
            circleLocations = this.translatePoints( this.currentOrgContributorCircles.circleCenters, dx, dy );
            console.log(circleLocations);

            // render jobs (circles)
            for (var j in this.jobsAtThisLevel) 
            {
                var job = this.mioarchy.jobs[ this.jobsAtThisLevel[j] ];

                var defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none";
                var color = this.determineContributorColor( job, this.mioarchy );
                var defaultWidth = this.CIRCLE_DIAMETER;
                var defaultHeight = this.CIRCLE_DIAMETER;
                var cx = circleLocations[j].x;
                var cy = circleLocations[j].y;

                var label;
                if ( job.contributor != null) {
                    label = j.contributor; //hortName.toLowerCase();
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
                    var orgLabel = job.organization;
                    graph.insertVertex(parent, null, orgLabel, x, y, this.width, this.height,
                            "shape=ellipse;fillColor=none;whiteSpace=wrap;fillColor=none;" +
                            "abelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                } finally {
                    graph.getModel().endUpdate();
                }
            }

        } else {

            // note that this is an organization that has other organizations but also child jobs at this level
            var isParentOrgWithJobs = this.jobsAtThisLevel.length > 0;

            // translate to 0,0
            var d = this.getXYOffsetFromPoints( this.currentOrgContributorCircles.circleCenters );
            // now account for containing circle center, using the org sub circles as reference
            //TODO: this might be causing the offset problem for DES which has a smaller circle
            var dx = x - d.x + (this.width - this.subOrgCircles.width / 2);
            var dy = y - d.y + (this.height - this.subOrgCircles.height / 2);
            circleLocations = this.translatePoints( this.subOrgCircles.circleCenters, dx, dy );

            // render organizations (circles)
            for (var i = 0; i < this.children.length; i++ ) {
                // current org rendering info
                var orgRenderInfo = this.children[i];
                var orgLabel = orgRenderInfo.org.name;

                graph.getModel().beginUpdate();
                try {
                    var parent = graph.getDefaultParent();
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
            Point d = getXYOffsetFromPoints(this.currentOrgContributorCircles.circleCenters);

            double w = (this.width - this.currentOrgContributorCircles.width()) / 2;
            double h = (this.height - this.currentOrgContributorCircles.height()) / 2;
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
            Point[] circleLocations = translatePoints(this.currentOrgContributorCircles.circleCenters, dx, dy);

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

    determineContributorColor: function(job, mioarchy)
    {
        var colorString = "";
        var l = job.accountabilityLevel.toLowerCase();

        // this is a lead
        if (l.indexOf("senior") >= 0 || l.indexOf("executive") >= 0 || l.indexOf("director") >= 0) {
            colorString += "dark"; 
        }

        // by app now
        if (job.application != null) {
            var appName = job.application.toLowerCase();

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
            if (job.organization != null) {
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
        var pointsTranslated = [];
        for (var p in points) {
            pointsTranslated.push( { x: points[p].x + dx, y: points[p].y + dy } );
        }
        return pointsTranslated;
    },

    calculateBoundingCircleDiameter: function(width, height) {
        return Math.sqrt( width*width + height*height );
    },

    // TODO: this ignores circle radius -- this could be causing positioning errors i've been seeing
    getXYOffsetFromPoints: function(points) {
        var x = Number.MAX_VALUE;
        var y = Number.MAX_VALUE;
        for (var p in points) {
            x = Math.min(x, points[p].x);
            y = Math.min(y, points[p].y);
        }
        return { x: x, y: y };
    }
}