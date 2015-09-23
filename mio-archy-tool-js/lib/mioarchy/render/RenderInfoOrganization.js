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
    this.numJobsInTotal = mioarchy.getOrganizationJobs( org, true ).length;

    // retrieve child orgs
    this.childOrgs = mioarchy.getOrganizationChildren( org );

    // a leaf org is rendered differently than a parent org
    this.isLeaf = this.childOrgs.length == 0;

    // get list of jobs
    this.jobsAtThisLevel = mioarchy.getOrganizationJobs( org, false );
    this.jobsAtThisLevelPosition = { x: 0, y: 0 };

    // yes, and populate child org infos
    for (var o in this.childOrgs) {
        this.childRenderingInfos.push( new RenderInfoOrganization( this.childOrgs[o], mioarchy ) );
    }

    // the remaining contributors at this level could be treated as their own organization, without the
    // actual org boundaries, so essentially they will be accounted for as a circle in the rendering calculations
    // but will not have a circle drawn around them
    var useMiddle = this.childOrgs.length > 0;
    this.circleForContributorsAtThisOrgLevel = new RenderInfoCircles(this.jobsAtThisLevel.length,
        this.MIN_DISTANCE_BETWEEN_CIRCLES, this.CIRCLE_DIAMETER, useMiddle); // orgs with children use middle

    determineMaximumSubOrgDimensions.call(this);

    // include the org without a circle as a fake org
    this.numSubOrgCircles = this.jobsAtThisLevel.length == 0 ? this.childOrgs.length : this.childOrgs.length + 1;

    if (this.orgLevel > 2 && !this.org.isApplication) {
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
    var useMiddle = this.childOrgs.length > 0;
    this.subOrgCircles = new RenderInfoCircles(this.numSubOrgCircles, this.MIN_DISTANCE_BETWEEN_CIRCLES, this.maxOrgCircleDiameter, useMiddle);

    // max dimensions determine by the sub org circle max dimensions
    this.width = this.subOrgCircles.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
    this.height = this.subOrgCircles.height + this.MIN_DISTANCE_BETWEEN_CIRCLES;
}

function processRectangularOrgRendering()
{
    // we will be sorting orgs into two piles: normal orgs and applications
    var applicationOrgInfos = { positions:[], orgRefs:[], width:0, height:0, cx:this.MIN_DISTANCE_BETWEEN_CIRCLES };
    var normalOrgInfos = { positions:[], orgRefs:[], width:0, height:0, cx:this.MIN_DISTANCE_BETWEEN_CIRCLES };

    // first, find the max heights so we can properly calculate the y positions and total org height
    for (var r in this.childRenderingInfos) {
        var ri = this.childRenderingInfos[r];
        if (ri.org.isApplication) {
            applicationOrgInfos.height = Math.max(applicationOrgInfos.height, ri.height);
        } else {
            normalOrgInfos.height = Math.max(normalOrgInfos.height, ri.height);
        }
    }
    // also include the contributor org in the set of apps
    if (this.jobsAtThisLevel.length > 0) {
        applicationOrgInfos.height = Math.max(applicationOrgInfos.height, this.circleForContributorsAtThisOrgLevel.height);
    }

    // we are now ready to determine the height of this org
    // (m + hmax_a + 2m + hmax_o + m)
    this.height = applicationOrgInfos.height + normalOrgInfos.height + this.MIN_DISTANCE_BETWEEN_CIRCLES * 4;

    // add the contributor circles first in the set of apps if it exists
    if (this.jobsAtThisLevel.length > 0) {
        // org must be corrected to 0,0 (TODO: this really should be circle org rendering's responsibility!)
        var dx = this.circleForContributorsAtThisOrgLevel.width/2;
        var dy = this.circleForContributorsAtThisOrgLevel.height/2;

        applicationOrgInfos.cy = this.MIN_DISTANCE_BETWEEN_CIRCLES + (applicationOrgInfos.height-this.circleForContributorsAtThisOrgLevel.height)/2
        this.jobsAtThisLevelPosition = {x: applicationOrgInfos.cx + dx, y: applicationOrgInfos.cy + dy };
        applicationOrgInfos.cx += this.circleForContributorsAtThisOrgLevel.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
        applicationOrgInfos.width = applicationOrgInfos.cx;
    }

    // next, calculate the x and y positions for the apps and normal sub orgs
    for (var r in this.childRenderingInfos) {
        var ri = this.childRenderingInfos[r];
        if (ri.org.isApplication) {
            applicationOrgInfos.cy = this.MIN_DISTANCE_BETWEEN_CIRCLES + (applicationOrgInfos.height-ri.height)/2;
            applicationOrgInfos.positions.push( {x: applicationOrgInfos.cx, y: applicationOrgInfos.cy, } );
            applicationOrgInfos.orgRefs.push( ri.org );
            applicationOrgInfos.cx += ri.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
            applicationOrgInfos.width = applicationOrgInfos.cx;
        } else {
            normalOrgInfos.cy = this.MIN_DISTANCE_BETWEEN_CIRCLES + (normalOrgInfos.height-ri.height)/2;
            normalOrgInfos.positions.push( {x: normalOrgInfos.cx, y: normalOrgInfos.cy } );
            normalOrgInfos.orgRefs.push( ri.org );
            normalOrgInfos.cx += ri.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
            normalOrgInfos.width = normalOrgInfos.cx;
        }
    }
    // finally, determine which is the widest, and that becomes the total org width
    this.width = Math.max( applicationOrgInfos.cx, normalOrgInfos.cx );
    // the last step is to translate each coord to its respective position
    if (applicationOrgInfos.width < normalOrgInfos.width) {
        // applications are smaller, so translate the application orgs on the x axis (centering)
        var dx = (this.width - applicationOrgInfos.width) / 2;
        applicationOrgInfos.positions = RenderingUtilities.translatePoints(applicationOrgInfos.positions, dx, 0);
    } else {
        // normal orgs are wider, so translate them on the x axis (centering)
        var dx = (this.width - normalOrgInfos.width) / 2;
        normalOrgInfos.positions = RenderingUtilities.translatePoints(normalOrgInfos.positions, dx, 0);
    }
    // move the contributor circle over
    this.jobsAtThisLevelPosition.x += (this.width - applicationOrgInfos.width) / 2;
    // also, normal orgs always get rendered underneath the apps
    var dy = applicationOrgInfos.height + this.MIN_DISTANCE_BETWEEN_CIRCLES * 2;
    normalOrgInfos.positions = RenderingUtilities.translatePoints(normalOrgInfos.positions, 0, dy);

    // now combine both arrays into the final product
    this.subOrgPositions = [];
    for (var i = 0; i < applicationOrgInfos.positions.length; i++) {
        var position = applicationOrgInfos.positions[i];
        var orgName = applicationOrgInfos.orgRefs[i].name;
        this.subOrgPositions[orgName] = position;
    }
    for (var i = 0; i < normalOrgInfos.positions.length; i++) {
        var position = normalOrgInfos.positions[i];
        var orgName = normalOrgInfos.orgRefs[i].name;
        this.subOrgPositions[orgName] = position;
    }

    // final correction: if there weren't any normal orgs, i.e. this was an app, reduce the overall height
    if (normalOrgInfos.positions.length == 0) {
        this.height -= this.MIN_DISTANCE_BETWEEN_CIRCLES * 2;
    }
}

function renderJobsAtThisOrgLevel(x, y, dx, dy, graph) {
    // now move all the circle locations as needed
    var circleLocations = RenderingUtilities.translatePoints(this.circleForContributorsAtThisOrgLevel.circleCenters, dx, dy);

    // render jobs (circles)
    for (var j in this.jobsAtThisLevel) {
        var job = this.mioarchy.jobs[this.jobsAtThisLevel[j]];

        var defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none;editable=0;";
        var color = this.determineContributorColor(job, this.mioarchy);
        var defaultWidth = this.CIRCLE_DIAMETER;
        var defaultHeight = this.CIRCLE_DIAMETER;

        // normal coords are the x,y coords + the circle coords
        // (the normal drawing is the top-left of the circle, so we must offset by the circle dimensions)
        var cx = x + circleLocations[j].x - this.CIRCLE_DIAMETER / 2;
        var cy = y + circleLocations[j].y - this.CIRCLE_DIAMETER / 2;

        var label;
        if (job.contributor && this.mioarchy.contributors[job.contributor]) {
            label = this.mioarchy.namesToShortNames[job.contributor].shortName;
        } else {
            label = "NEW"; // not yet hired
        }

        // actually "draw" :)
        graph.getModel().beginUpdate();
        try {
            var parent = graph.getDefaultParent();
            var v = graph.insertVertex(parent, null, label, cx, cy, defaultWidth, defaultHeight,
                defaultStyle + "gradientColor=" + color);
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
        /*
        if (this.jobsAtThisLevel == 0) {
            console.log(this.org.name + " has no contributors. Skipping rendering.");
            return;
        }*/
        //==============================================================================================================
        // TOP LEVEL ORGANIZATIONS
        if (this.orgLevel <= 2 || this.org.isApplication) {
            // if there are jobs, render them
            if (this.jobsAtThisLevel.length > 0) {
                if (this.subOrgPositions) {
                    var dx, dy;
                    cx = x + this.jobsAtThisLevelPosition.x;
                    cy = y + this.jobsAtThisLevelPosition.y;
                    renderJobsAtThisOrgLevel.call(this, cx, cy, 0, 0, graph);
                }
            }
            //==========================================================================================================
            // CHILDREN OF TOP LEVEL ORGANIZATION
            for (var i = 0; i < this.childRenderingInfos.length; i++) {
                // current org rendering info
                var orgRenderInfo = this.childRenderingInfos[i];
                var orgPosition = this.subOrgPositions[ orgRenderInfo.org.name ];
                if (typeof(orgPosition) == 'undefined') {
                    console.log("UNDEFINED ORG POSITION!!!");
                }
                // render organization internals
                orgRenderInfo.render(x + orgPosition.x, y + orgPosition.y, graph);
            }
            //==========================================================================================================
            // BOUNDING BOX FOR TOP LEVEL ORGANIZATION
            graph.getModel().beginUpdate();
            try {
                var parent = graph.getDefaultParent();
                var orgLabel = this.org.name;

                // stroke is different for applications
                var stroke = "";
                var shape = "rounded=1;"
                if (this.org.isApplication) {
                    // highlight the jobs this person has taken on
                    var appColor = this.mioarchy.applications[this.org.name].color;
                    stroke = "strokeWidth=10;strokeColor="+appColor+";opacity=100;";
                    shape = "shape=process;";
                }
                var vertex = graph.insertVertex(parent, null, orgLabel, x, y, this.width, this.height,
                    shape + "fillColor=none;whiteSpace=wrap;editable=0;" + stroke +
                    "labelPosition=center;verticalLabelPosition=middle;align=center;verticalAlign=top;");
                // attach the org info to the vertex
                vertex.mioObject = this.org;
                this.mioarchy.orgToVertex[orgLabel] = vertex;
                // send to back
                graph.cellsOrdered([vertex], true);

            } finally {
                graph.getModel().endUpdate();
            }
        }
        //==============================================================================================================
        // SUB ORGANIZATION
        else {
            //==========================================================================================================
            // SUB ORGANIZATION WITH CHILDREN
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
                        "shape=ellipse;fillColor=none;whiteSpace=wrap;editable=0;" +
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

                    // offset by containing circle dimensions, as well as sub circle dimensions
                    var cx = x + circleLocations[i].x + this.width / 2 - orgRenderInfo.width / 2;
                    var cy = y + circleLocations[i].y + this.width / 2 - orgRenderInfo.height / 2;

                    // render organization internals
                    orgRenderInfo.render(cx, cy, graph);
                }
            }
            //==========================================================================================================
            // LEAF ORGANIZATION
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
                        "shape=ellipse;fillColor=none;whiteSpace=wrap;editable=0;" +
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
            //==========================================================================================================
            // JOBS AT THIS SUB ORGANIZATION LEVEL
            if (this.jobsAtThisLevel.length > 0) {
                // now move all the circle locations as needed
                var circleLocations = RenderingUtilities.translatePoints(this.circleForContributorsAtThisOrgLevel.circleCenters, dx, dy);

                // render jobs (circles)
                for (var j in this.jobsAtThisLevel) {
                    var job = this.mioarchy.jobs[this.jobsAtThisLevel[j]];

                    var defaultStyle = "shape=ellipse;whiteSpace=wrap;gradientColor=none;editable=0;";
                    var color = this.determineContributorColor(job, this.mioarchy);
                    var defaultWidth = this.CIRCLE_DIAMETER;
                    var defaultHeight = this.CIRCLE_DIAMETER;

                    // normal coords are the x,y coords + the circle coords
                    // (the normal drawing is the top-left of the circle, so we must offset by the circle dimensions)
                    var cx = x + circleLocations[j].x - this.CIRCLE_DIAMETER / 2;
                    var cy = y + circleLocations[j].y - this.CIRCLE_DIAMETER / 2;

                    var label;
                    if (job.contributor && this.mioarchy.contributors[job.contributor]) {
                        label = this.mioarchy.namesToShortNames[job.contributor].shortName;
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