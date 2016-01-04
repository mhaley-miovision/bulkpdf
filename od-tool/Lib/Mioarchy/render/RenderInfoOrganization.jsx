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
    var orgLevel = this.mioarchy.getOrganizationLevel(this.org);
    var paddingForLabel = this.org.isApplication ? 50 : (orgLevel == 1 ? 180 : 100);

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
    this.height = applicationOrgInfos.height + normalOrgInfos.height + this.MIN_DISTANCE_BETWEEN_CIRCLES * 4 + paddingForLabel;

    // add the contributor circles first in the set of apps if it exists
    if (this.jobsAtThisLevel.length > 0) {
        // org must be corrected to 0,0 (TODO: this really should be circle org rendering's responsibility!)
        var dx = this.circleForContributorsAtThisOrgLevel.width/2;
        var dy = this.circleForContributorsAtThisOrgLevel.height/2;

        applicationOrgInfos.cy = paddingForLabel + this.MIN_DISTANCE_BETWEEN_CIRCLES + (applicationOrgInfos.height-this.circleForContributorsAtThisOrgLevel.height)/2
        this.jobsAtThisLevelPosition = {x: applicationOrgInfos.cx + dx, y: applicationOrgInfos.cy + dy };
        applicationOrgInfos.cx += this.circleForContributorsAtThisOrgLevel.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
        applicationOrgInfos.width = applicationOrgInfos.cx;
    }

    // next, calculate the x and y positions for the apps and normal sub orgs
    for (var r in this.childRenderingInfos) {
        var ri = this.childRenderingInfos[r];
        if (ri.org.isApplication) {
            applicationOrgInfos.cy = paddingForLabel + this.MIN_DISTANCE_BETWEEN_CIRCLES + (applicationOrgInfos.height-ri.height)/2;
            applicationOrgInfos.positions.push( {x: applicationOrgInfos.cx, y: applicationOrgInfos.cy, } );
            applicationOrgInfos.orgRefs.push( ri.org );
            applicationOrgInfos.cx += ri.width + this.MIN_DISTANCE_BETWEEN_CIRCLES;
            applicationOrgInfos.width = applicationOrgInfos.cx;
        } else {
            normalOrgInfos.cy = paddingForLabel + this.MIN_DISTANCE_BETWEEN_CIRCLES + (normalOrgInfos.height-ri.height)/2;
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

        var defaultStyle = "shape=ellipse;whiteSpace=wrap;editable=0;";
        var colorString = this.getJobColorStyleString(job.id, this.mioarchy);
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
                defaultStyle + colorString);
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
    render: function (x, y, graph) {

        if (this.orgLevel <= 2 || this.org.isApplication) {
            this.renderRectangularOrg(x, y, graph);
        } else {
            this.renderCircularOrg(x, y, graph);
        }
    },

    getJobTopApplicationAccountabilities: function(jobId, mioarchy, maxAccountabilities) {
        var list = [];
        var accountabilities = mioarchy.jobAccountabilities[jobId];

        if (accountabilities) {
            // count each type of accountability
            var accountabilityCounts = [];
            for (var i = 0; i < accountabilities.length; i++) {
                var acc = accountabilities[i];
                if (acc.application !== "") { // skip non-application accountabilities
                    if (accountabilityCounts[acc.application]) {
                        accountabilityCounts[acc.application]++;
                    } else {
                        accountabilityCounts[acc.application] = 1;
                    }
                }
            }
            // loop through the array picking the biggest one each time
            var numLoops = Math.min(maxAccountabilities, Object.keys(accountabilityCounts).length);
            while (numLoops > 0) {
                var largestCount = 0;
                var largestApp = null;
                for (var aci in accountabilityCounts) {
                    if (largestCount < accountabilityCounts[aci]) {
                        largestCount = accountabilityCounts[aci];
                        largestApp = aci;
                    }
                }
                // remove the largest count and add to the list to be returned
                delete accountabilityCounts[aci];
                list.push( aci );
                numLoops--;
            }
        }
        return list;
    },

    getJobColors: function (jobId, mioarchy) {
        // determine which are the dominating accountabilities
        var apps = this.getJobTopApplicationAccountabilities(jobId, mioarchy, 2);
        var list = [];
        for (var i = 0; i < apps.length; i++) {
            var appColor = mioarchy.applications[ apps[i] ].color;
            list.push( appColor );
        }

        if (list.length == 0) {
            var app = mioarchy.jobs[jobId].application;
            if (app) {
                var color = mioarchy.applications[app].color;
                if (color) {
                    list.push(color);
                    list.push("white");
                }
            }
        }
        return list;
    },

    //==============================================================================================================
    // TOP LEVEL ORGANIZATIONS
    renderRectangularOrg: function (x, y, graph) {
        // if there are jobs, render them
        if (this.jobsAtThisLevel.length > 0) {
            if (this.subOrgPositions) {
                var cx, cy;
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
            var orgPosition = this.subOrgPositions[orgRenderInfo.org.name];
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
            // stroke is different for applications
            var vertex = this.insertOrgVertex (graph.getDefaultParent(), this.org, x, y, this.width, this.height, graph);

            // attach the org info to the vertex
            vertex.mioObject = this.org;
            this.mioarchy.orgToVertex[this.org.name] = vertex;
            // send to back
            graph.cellsOrdered([vertex], true);

        } finally {
            graph.getModel().endUpdate();
        }
    },

    //==============================================================================================================
    // SUB ORGANIZATION
    renderCircularOrg: function (x, y, graph) {
        //==========================================================================================================
        // SUB ORGANIZATION WITH CHILDREN
        if (!this.isLeaf) {
            // first we will draw the circle that will contain our sub circles
            graph.getModel().beginUpdate();
            try {
                var vertex = this.insertOrgVertex (graph.getDefaultParent(), this.org, x, y, this.width, this.height, graph);

                // attach the org info to the vertex
                vertex.mioObject = this.org;
                this.mioarchy.orgToVertex[this.org.name] = vertex;
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
                var vertex = this.insertOrgVertex (graph.getDefaultParent(), this.org, x, y, this.width, this.height, graph);

                // attach the org info to the vertex
                vertex.mioObject = this.org;
                this.mioarchy.orgToVertex[this.org.name] = vertex;

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

                var defaultStyle = "shape=ellipse;whiteSpace=wrap;editable=0;";
                var colorString = this.getJobColorStyleString(job.id, this.mioarchy);
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
                        defaultStyle + colorString);
                    // attach the org info to the vertex
                    v.mioObject = job;
                    this.mioarchy.jobToVertex[job.id] = v;
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        }
    },

    getJobColorStyleString: function(jobId, mioarchy) {
        var colors = this.getJobColors(jobId, mioarchy);

        var colorString = "fillColor=" + (colors && colors.length > 0 ? colors[0] : "white");
        colorString += ";";
        if (colors.length > 1) {
            colorString += "gradientColor=" + colors[1] + ";gradientDirection=east;";
        }

        // temp jobs are shown as dashed (if it's not a full time contributor)
        if (mioarchy.jobs[jobId].contributor && mioarchy.contributors[mioarchy.jobs[jobId].contributor]
            && mioarchy.contributors[mioarchy.jobs[jobId].contributor].employeeStatus
            && mioarchy.contributors[mioarchy.jobs[jobId].contributor].employeeStatus.toLowerCase() !== 'full time') {
            colorString += "dashed=1;";
        }

        return colorString;
    },

    insertOrgVertex: function (parent, org, x, y, width, height, graph) {
        var orgLevel = this.mioarchy.getOrganizationLevel(org);
        var style = "labelPosition=center;align=center;verticalAlign=top;editable=0;whiteSpace=wrap;fillColor=none;";

        if (org.isApplication) {
            // highlight the jobs this person has taken on
            var appColor = this.mioarchy.applications[org.name].color;
            var stroke = "strokeWidth=10;strokeColor=" + appColor + ";opacity=100;";
            style += stroke + "shape=process;";
        } else {
            if (this.isLeaf) {
                style += "shape=ellipse;"
            } else if (orgLevel <= 2) {
                style += "rounded=1;";
            } else {
                style += "shape=ellipse;";
            }
        }

        var fontSize = 11;
        switch (orgLevel) {
            case 1:
                fontSize = 130;
                break;
            case 2:
                fontSize = 80;
                break;
            case 3:
                fontSize = 50;
                break;
            case 4:
                fontSize = 20;
                break;
            default:
                fontSize = 15;
                break;
        }
        if (org.isApplication) {
            fontSize = 30;
        }
        if (this.mioarchy.getOrganizationChildren(org).length == 0) {
            fontSize = 20;
        }

        if (orgLevel <= 2) {
            style += "fontColor=#357EC7;";
        } else if (!org.isApplication) {
            style += "fontColor=#98AFC7;";
        }
        style += "fontSize=" + fontSize + ";";

        return graph.insertVertex(parent, null, org.name, x, y, width, height, style);
    }
}