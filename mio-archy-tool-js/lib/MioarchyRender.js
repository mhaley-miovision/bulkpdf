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
    // constants
    this.CIRCLE_DIAMETER = 40;
    this.MIN_DISTANCE_BETWEEN_CIRCLES = 40;

    this.org = org;
    this.childRenderingInfos = [];
    this.mioarchy = mioarchy;
    this.orgLevel = mioarchy.getOrganizationLevel( org );

    // retrieve child orgs
    this.childOrgs = mioarchy.getOrganizationChildren( org );

    // a leaf org is rendered differently than a parent org
    this.isLeaf = this.childOrgs.length == 0;

    // get list of jobs
    this.jobsAtThisLevel = mioarchy.getOrganizationJobs( org, false );

    // does org have children?
    if (this.isLeaf) {
        processLeafRenderingInfo.call(this);
    } else {
        // yes, and populate child org infos
        for (var o in this.childOrgs) {
            this.childRenderingInfos.push( new RenderInfoOrganization( this.childOrgs[o], mioarchy ) );
        }

        // the remaining contributors at this level could be treated as their own organization, without the
        // actual org boundaries, so essentially they will be accounted for as a circle in the rendering calculations
        // but will not have a circle drawn around them
        this.circleForContributorsAtThisOrgLevel = new RenderInfoCircles(this.jobsAtThisLevel.length, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, true);

        determineMaximumSubOrgDimensions.call(this);

        // include the org without a circle as a fake org
        this.numSubOrgCircles = this.jobsAtThisLevel.length == 0 ? this.childOrgs.length : this.childOrgs.length + 1;

        if (this.orgLevel > 2) {
            processCircularSubOrgRendering.call(this);
        } else {
            processRectangularOrgRendering.call(this);
        }
    }
}

function processLeafRenderingInfo() {
    // no, treat this as a group of contributors - assume circle rendering
    // generate circle info for this org (it is a LEAF!)
    this.circleForContributorsAtThisOrgLevel = new RenderInfoCircles(
        this.jobsAtThisLevel.length, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, false );

    // circle
    this.width = this.calculateBoundingCircleDiameter( this.circleForContributorsAtThisOrgLevel.width, this.circleForContributorsAtThisOrgLevel.height );
    this.height = this.width;

    this.maxOrgCircleDiameter = this.width; // not really used, just being diligent
}

function determineMaximumSubOrgDimensions() {
    // determine the radius of the new circle based on width and height of the biggest sub org
    this.maxOrgWidth = 0;
    this.maxOrgHeight = 0;
    for (var riIndex in this.childRenderingInfos) {
        var ri = this.childRenderingInfos[riIndex];
        this.maxOrgWidth = Math.max(this.maxOrgWidth, ri.width);
        this.maxOrgHeight = Math.max(this.maxOrgHeight, ri.height);
    }

    // also include the fake circle
    this.maxOrgCircleDiameter = Math.max( this.maxOrgWidth, this.maxOrgHeight );
    this.maxOrgCircleDiameter = Math.max( this.maxOrgCircleDiameter, this.circleForContributorsAtThisOrgLevel.width );
    this.maxOrgCircleDiameter = Math.max( this.maxOrgCircleDiameter, this.circleForContributorsAtThisOrgLevel.height );
}

function processCircularSubOrgRendering() {
    // calculate circle rendering info as though the sub orgs were just circles
    this.subOrgCircles = new RenderInfoCircles(this.numSubOrgCircles, 0, this.maxOrgCircleDiameter, true);

    // max dimensions determine by the sub org circle max dimensions
    this.width = this.subOrgCircles.width;
    this.height = this.subOrgCircles.height;
}

function processRectangularOrgRendering() {
    // the height is the max org height plus margins
    this.height = this.maxOrgHeight + this.MIN_DISTANCE_BETWEEN_CIRCLES * 4;

    // width requires us to calculate the positions of the sub orgs
    // start from the left, and add until all done
    // TODO: refactor this so that we are not using different objects when doing rectangular vs. circular (i.e. use inheritance)
    this.subOrgPositions = [];
    var x = this.MIN_DISTANCE_BETWEEN_CIRCLES;
    for (var r in this.childRenderingInfos) {
        var ri = this.childRenderingInfos[r];

        // center vertically wrt this rectangle
        var y = this.MIN_DISTANCE_BETWEEN_CIRCLES + (this.height-ri.height)/2;
        // save the coordinate
        this.subOrgPositions.push( {x:x, y:y} );
        // next
        x += ri.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
    }

    // now we can deduce total width
    this.width = x;
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
    render: function(x, y, graph)
    {
         if (this.orgLevel <= 2) {
             // render the children of this org
             for (var i = 0; i < this.childRenderingInfos.length; i++) {
                 // current org rendering info
                 var orgRenderInfo = this.childRenderingInfos[i];
                 var orgPosition = this.subOrgPositions[i];

                 // render organization internals
                 orgRenderInfo.render(x + orgPosition.x, y + orgPosition.y, graph);
             }

             // next we will draw the box that will contain our sub orgs
             graph.getModel().beginUpdate();
             try {
                 var parent = graph.getDefaultParent();
                 var orgLabel = this.org.name;

                 // the normal drawing is the top-left of the circle, so we must offset by the circle dimensions
                 var cx = x;
                 var cy = y;

                 var vertex = graph.insertVertex(parent, null, orgLabel, x, y, this.width, this.height,
                     "rounded=1;fillColor=none;whiteSpace=wrap;" +
                     "labelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                 // attach the org info to the vertex
                 vertex.org = this.org;

             } finally {
                 graph.getModel().endUpdate();
             }
         } else {
             // leaf is treated differently (as simple set of job circles)
             if (!this.isLeaf) {
                 // first we will draw the circle that will contain our sub circles
                 graph.getModel().beginUpdate();
                 try {
                     var parent = graph.getDefaultParent();
                     var orgLabel = this.org.name;

                     // the normal drawing is the top-left of the circle, so we must offset by the circle dimensions
                     var cx = x;
                     var cy = y;

                     var vertex = graph.insertVertex(parent, null, orgLabel, cx, cy, this.width, this.height,
                         "shape=ellipse;fillColor=none;whiteSpace=wrap;" +
                         "labelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                     // attach the org info to the vertex
                     vertex.mioObject = this.org;
                     this.mioarchy.orgToVertex[orgLabel] = vertex;

                 } finally {
                     graph.getModel().endUpdate();
                 }

                 // render organizations (circles)
                 var circleLocations = this.subOrgCircles.circleCenters;
                 for (var i = 0; i < this.childRenderingInfos.length; i++) {
                     // current org rendering info
                     var orgRenderInfo = this.childRenderingInfos[i];
                     var orgLabel = orgRenderInfo.org.name;

                     // offset by containing circle dimensions, as well as sub circle dimensions
                     var cx = x + circleLocations[i].x + this.width / 2 - orgRenderInfo.width / 2;
                     var cy = y + circleLocations[i].y + this.width / 2 - orgRenderInfo.height / 2;

                     // render organization internals
                     orgRenderInfo.render(cx, cy, graph);
                 }
             }
             // offsets
             var dx = 0;
             var dy = 0;
             // only draw the containing circle if this is a leaf
             if (this.isLeaf) {
                 // first we will draw the circle that will contain our job circles
                 graph.getModel().beginUpdate();
                 try {
                     var parent = graph.getDefaultParent();
                     var orgLabel = this.org.name;

                     // the normal drawing is the top-left of the circle, so we must offset by the circle dimensions
                     var cx = x;
                     var cy = y;

                     var vertex = graph.insertVertex(parent, null, orgLabel, cx, cy, this.width, this.height,
                         "shape=ellipse;fillColor=none;whiteSpace=wrap;" +
                         "abelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                     // attach the org info to the vertex
                     vertex.mioObject = this.org;
                     this.mioarchy.orgToVertex[orgLabel] = vertex;

                 } finally {
                     graph.getModel().endUpdate();
                 }
                 // offset by half of the containing circle dimensions
                 dx = this.width / 2;
                 dy = this.height / 2;
             } else {
                 // this is the last "virtual" circle in the calculate rendering infos for this org, which contains the
                 // jobs at this level
                 var lastCircle = this.subOrgCircles.circleCenters[this.subOrgCircles.circleCenters.length - 1];
                 dx = lastCircle.x + this.width / 2;
                 dy = lastCircle.y + this.width / 2;
             }
             // if there are jobs, render them
             if (this.jobsAtThisLevel.length > 0) {
                 // now move all the circle locations as needed
                 var circleLocations = this.translatePoints(this.circleForContributorsAtThisOrgLevel.circleCenters, dx, dy);

                 // render jobs (circles)
                 for (var j in this.jobsAtThisLevel) {
                     var job = this.mioarchy.jobs[this.jobsAtThisLevel[j]];

                     var defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none";
                     var color = this.determineContributorColor(job, this.mioarchy);
                     var defaultWidth = this.CIRCLE_DIAMETER;
                     var defaultHeight = this.CIRCLE_DIAMETER;

                     // normal coords are the x,y coords + the circle coords
                     // (the normal drawing is the top-left of the circle, so we must offset by the circle dimensions)
                     var cx = x + circleLocations[j].x - this.CIRCLE_DIAMETER / 2;
                     var cy = y + circleLocations[j].y - this.CIRCLE_DIAMETER / 2;

                     var label;
                     if (job.contributor && this.mioarchy.contributors[job.contributor]) {
                         var fi = this.mioarchy.contributors[job.contributor].firstName.substring(0, 1);
                         var li = this.mioarchy.contributors[job.contributor].lastName.substring(0, 1);
                         // TODO: resolve name clashes in order to make unique
                         label = (fi + li).toLowerCase();
                     } else {
                         label = "NEW"; // not yet hired
                     }

                     // actually "draw" :)
                     graph.getModel().beginUpdate();
                     try {
                         var parent = graph.getDefaultParent();
                         var v = graph.insertVertex(parent, null, label, cx, cy, defaultWidth, defaultHeight,
                             defaultStyle + ";gradientColor=" + color);
                         // attach the org info to the vertex
                         v.mioObject = job;
                         this.mioarchy.jobToVertex[job.id] = v;
                     } finally {
                         graph.getModel().endUpdate();
                     }
                 }
             }
         }
    },
    determineContributorColor: function(job, mioarchy)
    {
        var colorString = "";
        // this is a lead
        /*
         var l = job.accountabilityLabel.toLowerCase();
         if (l.indexOf("senior") >= 0 || l.indexOf("executive") >= 0 || l.indexOf("director") >= 0) {
         colorString += "dark";
         }*/

        // by app now
        if (job.application) {
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
            if (job.organization) {
                var org = mioarchy.organizations[job.organization];
                if (mioarchy.isDescendantOfOrganization( org, mioarchy.organizations["Engineering"] )) {
                    colorString += "purple";
                } else if (mioarchy.isDescendantOfOrganization( org, mioarchy.organizations["Finance"] )) {
                    colorString += "orange";
                } else if (mioarchy.isDescendantOfOrganization( org, mioarchy.organizations["Operations"] )) {
                    colorString += "blue";
                } else if (mioarchy.isDescendantOfOrganization( org, mioarchy.organizations["Operations"] )) {
                    colorString += "blue";
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
}