'use strict';

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
    this.subOrgCircles = new RenderInfoCircles(this.numSubOrgCircles, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.maxOrgCircleDiameter, true);

    // max dimensions determine by the sub org circle max dimensions
    this.width = this.subOrgCircles.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
    this.height = this.subOrgCircles.height + this.MIN_DISTANCE_BETWEEN_CIRCLES;
}

function processRectangularOrgRendering() {
    // the height is the max org height plus margins
    this.height = this.maxOrgHeight + this.MIN_DISTANCE_BETWEEN_CIRCLES * 4;

    // width requires us to calculate the positions of the sub orgs
    // start from the left, and add until all done
    // TODO: refactor this so that we are not using different objects when doing rectangular vs. circular (i.e. use inheritance)
    this.subOrgPositions = [];
    var x = this.MIN_DISTANCE_BETWEEN_CIRCLES;

    // first is the set of contributors at this level, which have to be separately added
    if (this.jobsAtThisLevel.length > 0) {
        var ri = this.circleForContributorsAtThisOrgLevel;

        // center vertically wrt this rectangle
        var y = this.MIN_DISTANCE_BETWEEN_CIRCLES + (this.height-ri.height)/2;
        // save the coordinate
        this.subOrgPositions.push( {x:x, y:y} );
        // next
        x += ri.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;

        // account for contributors being tall enough to resize this box
        this.height = Math.max(this.height, ri.height + this.MIN_DISTANCE_BETWEEN_CIRCLES);
    }

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

function renderJobsAtThisOrgLevel(x, y, dx, dy, graph) {
    // now move all the circle locations as needed
    var circleLocations = RenderingUtilities.translatePoints(this.circleForContributorsAtThisOrgLevel.circleCenters, dx, dy);

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
        if (this.jobsAtThisLevel == 0) {
            console.log(this.org.name + " has no contributors. Skipping rendering.");
            return;
        }

        if (this.orgLevel <= 2) {
            // if there are jobs, render them
            var pIndex = 0;
            if (this.jobsAtThisLevel.length > 0) {
                var dx, dy;
                if (this.subOrgPositions) {
                    dx = this.subOrgPositions[0].x + this.circleForContributorsAtThisOrgLevel.width / 2;
                    dy = this.subOrgPositions[0].y + this.circleForContributorsAtThisOrgLevel.height / 2;
                } else {
                    console.log("failed to find subOrgPositions but was expecting them! org=" + this.org.name);
                    dx = 0;
                    dy = 0;
                }

                renderJobsAtThisOrgLevel.call(this, x, y, dx, dy, graph);
                pIndex = 1;
            }
            // render the children of this org
            for (var i = 0; i < this.childRenderingInfos.length; i++) {
                // current org rendering info
                var orgRenderInfo = this.childRenderingInfos[i];
                var orgPosition = this.subOrgPositions[pIndex++];

                // render organization internals
                orgRenderInfo.render(x + orgPosition.x, y + orgPosition.y, graph);
            }
            // next we will draw the box that will contain our sub orgs
            graph.getModel().beginUpdate();
            try {
                var parent = graph.getDefaultParent();
                var orgLabel = this.org.name;

                // stroke is different for applications
                var stroke = "";
                if (this.org.isApplication.toLowerCase() == "true") {
                    // highlight the jobs this person has taken on
                    var appColor = this.mioarchy.applications[this.org.name].color;
                    stroke = "strokeWidth=10;strokeColor="+appColor+";opacity=50";
                }

                var vertex = graph.insertVertex(parent, null, orgLabel, x, y, this.width, this.height,
                    "rounded=1;fillColor=none;whiteSpace=wrap;" + stroke +
                    "labelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                // attach the org info to the vertex
                vertex.mioObject = this.org;
                this.mioarchy.orgToVertex[orgLabel] = vertex;
                // send to back
                graph.cellsOrdered([vertex], true);

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
                    // send to back
                    graph.cellsOrdered([vertex], true);

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
                var circleLocations = RenderingUtilities.translatePoints(this.circleForContributorsAtThisOrgLevel.circleCenters, dx, dy);

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
            colorString = mioarchy.applications[job.application].color;
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

}