console.log("mioarchyClient");


// read from the backend
var mioarchyClient = new MioarchyClient();
mioarchyClient.readDB(onDBReadCompleted);
mioarchyClient.targetRenderingOrg = "Miovision";

// stores the graph object
mioarchyClient.graph = null;
mioarchyClient.lastUpdated = new Date();

// initialize the editor once the DB is ready
function onDBReadCompleted()
{
    // Extends EditorUi to update I/O action states
    (function()
    {
        var editorUiInit = EditorUi.prototype.init;
        EditorUi.prototype.init = function()
        {
            editorUiInit.apply(this, arguments);
            this.actions.get('export').setEnabled(false);
        };
    })();
    new EditorUi (mioarchyClient, mioarchyClient.onEditorUIInitCompleted, new Editor(urlParams['chrome'] == '0'));
}

// called when editor UI has been fully initialized (to render the org)
mioarchyClient.onEditorUIInitCompleted = function( graph, editor ) {
    mioarchyClient.graph = graph;
    mioarchyClient.editor = editor;
    mioarchyClient.setupClickHandling(); // only once

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }
    var date = dd+'/'+mm+'/'+yyyy;

    mioarchyClient.activeTransformation = { startDate:date, endDate:date };
    mioarchyClient.applyActiveTransformation();

    mioarchyClient.currentKeyFrameIndex = mioarchyClient.getKeyIndexClosestToToday();
    mioarchyClient.updateAfterKeyFrameJump();

    mioarchyClient.initializeToolbar();
}

// renders the organization (first clears the graph)
mioarchyClient.renderOrganization = function() {
    if (mioarchyClient.graph) {
        // first, clear everything
        mioarchyClient.graph.removeCells(
            mioarchyClient.graph.getChildVertices( mioarchyClient.graph.getDefaultParent() ) );

        // then get the mioarchy client object (apply transformed version if available)
        mioarchyClient.applyActiveTransformation();
        var mioarchy = mioarchyClient.mioarchy;

        var ri = new RenderInfoOrganization( mioarchy.organizations[mioarchyClient.targetRenderingOrg], mioarchy );

        ri.render( 0, 0, mioarchyClient.graph );

        mioarchyClient.graph.fit();
        mioarchyClient.graph.view.rendering = true;
        mioarchyClient.graph.refresh();

        mioarchyClient.graph.setEnabled(false);

    } else {
        console.log("renderOrganization: _graph is undefined!!!");
    }
}

// called when last updated is read from the API
mioarchyClient.processLastUpdated = function( lastUpdated ) {
    var t1 = new Date(lastUpdated).getTime();
    var t2 = mioarchyClient.lastUpdated.getTime();
    if (t2 < t1) {
        mioarchyClient.lastUpdated = new Date();
        console.log("NOW UPDATING DUE TO DETECTED DATA MODEL CHANGE!!!");
        mioarchyClient.readDB( mioarchyClient.renderOrganization );
    } else {
    }
}

// applied the transormation parameters to the client side copy of the hierarchy, to prepare for rendering
mioarchyClient.applyActiveTransformation = function() {
    // start with the cached model
    mioarchyClient.mioarchy = mioarchyClient.mioarchyCachedModel;

    // if a transormation is active, apply it
    if (mioarchyClient.activeTransformation) {
        // time-bound transformations
        if (mioarchyClient.activeTransformation.startDate || mioarchyClient.activeTransformation.endDate)
        mioarchyClient.mioarchy = mioarchyClient.mioarchy.createFilteredMioarchy(mioarchyClient.activeTransformation);
    }
}

// check for updates every x seconds
setInterval( function() { mioarchyClient.getLastUpdated( mioarchyClient.processLastUpdated ) }, 5000 );

mioarchyClient.createTempUserImageDiv = function(x, y) {
    var borderSize = 1;
    var imgDimension = 96;
    var padding = 4;

    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.background = "url('img/ajax-loader.gif') no-repeat center";
    div.style.backgroundColor = "white";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.height = imgDimension + borderSize*2 + padding*2 + "px";
    div.style.width = imgDimension + borderSize*2 + padding*2 + "px";
    div.style.zIndex = 100000;

    document.body.appendChild(div);
    mioarchyClient.removeTempImg();
    mioarchyClient.tempUserImageDiv = div;

    return div;
};
mioarchyClient.tempUserImageDiv = null;

mioarchyClient.removeTempImg = function() {
    if (mioarchyClient.tempUserImageDiv) {
        try {
            document.body.removeChild(mioarchyClient.tempUserImageDiv);
            mioarchyClient.tempUserImageDiv = null;
        } catch (e) {
            console.log(e);
        }
    }
}

mioarchyClient.setupClickHandling = function() {

    Graph.prototype.dblClick = function (evt, cell) {
        mioarchyClient.graph.selectedGraphObject = cell;

        if (cell && mioarchyClient.graph.selectedGraphObject.mioObject
            && mioarchyClient.graph.selectedGraphObject.mioObject.type == Mioarchy.prototype.Types.Organization) {

            //graphComponent.zoomTo(scale, mioarchyClient.graph.isCenterZoom());

            /*
            console.log(evt);

            var x = evt.screenX;
            var y = evt.screenY;
            var w = 100;
            var h = 100;
            */

            /*
            var x = cell.geometry.x;
            var y = cell.geometry.y;
            var h = cell.geometry.width;
            var w = cell.geometry.height;
            */

            /*
            var rect = new mxRectangle(x, y, w, h);
            var graph = mioarchyClient.graph;

            graph.zoomToRect(rect);*/

            mioarchyClient.targetRenderingOrg = mioarchyClient.graph.selectedGraphObject.mioObject.name;
            mioarchyClient.render();

        } else {
            console.log("not rendering, not an org dbl clicked");
        }
    };

    var mouseListener =
    {
        currentState:null,
        lastHoveredCell:null,
        stateStyleBackup:null,
        lastSelectedObject:null,

        mouseUp: function(sender, me) {
            mioarchyClient.graph.selectedGraphObject = me.getCell();
            //console.log(mioarchyClient.graph.selectedGraphObject);

            if (this.lastSelectedObject == mioarchyClient.graph.selectedGraphObject) {
                console.log("this.lastSelectedObject == mioarchyClient.graph.selectedGraphObject");
                return; // performance optimization: don't redraw things every click if it's the same object
            } else {
                mioarchyClient.clearHighlights(); // new selection, clear the old one
            }

            // refresh format panel, and highlights
            mioarchyClient.editor.format.refresh();
            mioarchyClient.renderHighlightedApplicationOverlays();
            mioarchyClient.renderHighlightedContributorOverlays();

            // store which object was selected last
            this.lastSelectedObject = mioarchyClient.graph.selectedGraphObject;
        },
        mouseDown: function(sender, me) {

        },
        mouseMove: function(sender, me) {
            if (this.currentState != null && me.getState() == this.currentState) {
                return;
            }
            var cell = me.getCell();
            if (cell == this.lastHoveredCell) {
                return;
            }

            // only enable hovering highlighting functionality for organization objects
            if (cell && cell.mioObject &&
                (cell.mioObject.type == mioarchyClient.mioarchy.Types.Organization
                || cell.mioObject.type == mioarchyClient.mioarchy.Types.Job)) {

                if (cell.mioObject.type == mioarchyClient.mioarchy.Types.Job) {
                    if (mioarchyClient.mioarchy.contributors[cell.mioObject.contributor]) {
                        var email = mioarchyClient.mioarchy.contributors[cell.mioObject.contributor].email;
                        if (email) {
                            mioarchyClient.lastEmailUsedForImage = email;
                            var x = event.pageX;
                            var y = event.pageY;
                            mioarchyClient.tempUserImageDiv = mioarchyClient.createTempUserImageDiv(x, y);
                            mioarchyClient.loadUserImgSrc(email, mioarchyClient.tempUserImageDiv);
                        }
                    }
                } else {
                    mioarchyClient.removeTempImg();
                }

                // revert the previous cell to the old state, using the backup
                if (this.stateStyleBackup) {
                    var state = mioarchyClient.graph.view.getState(this.lastHoveredCell);

                    if (state) {
                        state.style = mxUtils.clone(this.stateStyleBackup);
                        //state.style[mxConstants.STYLE_FILLCOLOR] = '#ffffff'; // deep sky blue for hovering
                        state.style[mxConstants.STYLE_STROKEWIDTH] = '1';
                        state.shape.apply(state);
                        state.shape.redraw();

                        this.stateStyleBackup = null;
                        this.lastHoveredCell = null;
                        this.currentState = null;
                    }
                }
                // save the previous cell information
                var state = mioarchyClient.graph.view.getState(cell);
                if (state != null) {
                    this.stateStyleBackup = mxUtils.clone(state.style);
                    this.lastHoveredCell = cell;
                    this.currentState = state;

                    // set new style to highlight the cell
                    //state.style[mxConstants.STYLE_FILLCOLOR] = '#00bfff'; // deep sky blue for hovering
                    state.style[mxConstants.STYLE_STROKEWIDTH] = 4 * 1 / mioarchyClient.graph.view.scale;
                    state.shape.apply(state);
                    state.shape.redraw();
                }
            }
        },
    };
    mioarchyClient.graph.addMouseListener(mouseListener);
}

mioarchyClient.createMiovisionLabel = function(textContent, backgroundColor, textColor, isHeading) {
    var label = document.createElement('div');
    label.style.color = 'rgb(112, 112, 112)';
    label.style.border = '1px solid #c0c0c0';
    if (isHeading) {
        label.style.borderBottomColor = "#3F403F";
        label.style.borderBottomWidth = "2px";
    }
    label.style.fontWeight = isHeading ? 'bold' : 'normal';
    label.style.overflow = 'hidden';
    label.style.fontSize = 'hidden';
    label.style.display = isHeading ? '13' : '9';
    label.style.padding = '13px';
    label.style.width = '100%';
    label.style.color = textColor;
    label.style.backgroundColor = backgroundColor;
    label.textContent = textContent;
    if (!isHeading) {
        label.onmousemove = function () {
            label.style.color = "#3f403f";
            label.style.border = '1px solid #000000';
            label.style.backgroundColor = "#B9D6E9";
        }
        label.onmouseout = function () {
            label.style.color = textColor;
            label.style.border = '1px solid #c0c0c0';
            label.style.backgroundColor = backgroundColor;
        }
    }
    return label;
};

mioarchyClient.handleRightPaneRefresh = function(container, graph) {
    var getAccountabilityRatingColor = function (accountability) {
        var color = "#f7f7f7";

        if (mioarchyClient.accountabilityMode == 1) {
            if (accountability.application) {
                var app = mioarchyClient.mioarchy.applications[accountability.application];
                color = app.color;
            }
        } else {
            if (accountability.rating) {
                switch (accountability.rating) {
                    case "3":
                        color = "#b7e1cd";
                        break;
                    case "2":
                        color = "#fce8b2";
                        break;
                    case "1":
                        color = "#f4c7c3";
                        break;
                }
            }
        }
        return color;
    };

    var sortAccountabilityList = function(accountabilityList) {
        var accountabilities = [];
        // add to key value pair dictionary
        for (var i = 0; i < accountabilityList.length; i++) {
            var a = accountabilityList[i];

            // if currently highlighting an app, only show relevant
            if (mioarchyClient.selectedApplicationName && mioarchyClient.selectedApplicationName !== "All Applications") {
                var app = accountabilityList[i].application;
                if (app !== mioarchyClient.selectedApplicationName) {
                    // do not add to the list!
                    continue;
                }
            }

            // does it exist in the list
            if (typeof(accountabilities[a.accountabilityType]) == 'undefined') {
                accountabilities[a.accountabilityType] = [];
            }
            accountabilities[a.accountabilityType].push(a);
        }
        return accountabilities;
    }

    function renderSortedAccountabilities(accountabilities, groupLabel, parentElement) {
        // group label
        var label = parentElement.appendChild(mioarchyClient.createMiovisionLabel(groupLabel, '#B9D6E9', '#3F403F', true));

        // each accountability belonging to this label
        for (var i = 0; i < accountabilities.length; i++) {
            parentElement.appendChild(
                mioarchyClient.createMiovisionLabel(accountabilities[i].label, getAccountabilityRatingColor(accountabilities[i])));
        }
    }

    function renderAccountabilities(accountabilities, accountabilityLabel, parentElement) {
        // accountabilities label
        var headingLabel = parentElement.appendChild(mioarchyClient.createMiovisionLabel(accountabilityLabel, '#5885AA', '#FFFFFF', true));

        if (typeof(accountabilities) == 'undefined' || accountabilities.length == 0) {
            renderAccountabilitiesUndefined(parentElement);
        } else {
            var sortedAccountabilities = sortAccountabilityList(accountabilities);
            for (var acc in sortedAccountabilities) {
                renderSortedAccountabilities(sortedAccountabilities[acc], acc, parentElement);
            }
        }
    }

    function renderAccountabilitiesUndefined(parentElement) {
        // accountabilities label
        parentElement.appendChild(mioarchyClient.createMiovisionLabel("None defined.", '#E2E2E2', "3F403F", false));
    }

    // see if the selected object is a job
    var selectedGraphObject = graph.selectedGraphObject;

    if (selectedGraphObject && selectedGraphObject.mioObject && selectedGraphObject.mioObject.type === Mioarchy.prototype.Types.Job) {
        var job = selectedGraphObject.mioObject;
        var accountabilities = mioarchyClient.mioarchy.jobAccountabilities[job.id];

        // add contributor name heading
        container.appendChild(mioarchyClient.createMiovisionLabel(job.contributor, '#3F403F', '#FFFFFF', true));

        // add contributor image
        if (mioarchyClient.mioarchy.contributors[job.contributor]) {
            var email = mioarchyClient.mioarchy.contributors[job.contributor].email;
            if (email) {
                var div = document.createElement("div");
                //div.style.width = "100%";
                div.style.width = "auto";
                //div.style.backgroundColor = "rgb(63,63,63)";
                div.style.height = "96px";
                div.style.textAlign = "center";
                div.style.padding.top = "3px";
                div.style.padding.bottom = "3px";
                container.appendChild(div);
                mioarchyClient.loadUserImgSrc(email, div);
            }
        }

        renderAccountabilities(accountabilities, job.accountabilityLabel + " Accountabilities", container);
        mioarchyClient.renderHighlightedContributorOverlays();
    } else if (selectedGraphObject && selectedGraphObject.mioObject && selectedGraphObject.mioObject.type === Mioarchy.prototype.Types.Organization) {
        var organizationName = selectedGraphObject.mioObject.name;
        var accountabilities = mioarchyClient.mioarchy.orgAccountabilities[organizationName];
        renderAccountabilities(accountabilities, organizationName + " Accountabilities", container);
    }
}

mioarchyClient.handleApplicationFilterSelectionChange = function (applicationName) {
    // store application name, and redraw the accountabilities panel to only show the relevant ones
    mioarchyClient.selectedApplicationName = applicationName;
    mioarchyClient.render();
}

mioarchyClient.render = function(newOrg) {
    if (newOrg) {
        mioarchyClient.targetRenderingOrg = newOrg;
    }
    mioarchyClient.renderOrganization();
    mioarchyClient.editor.format.refresh();
    mioarchyClient.editor.sidebar.renderOrganizationTree();
    mioarchyClient.renderHighlightedApplicationOverlays();
}

mioarchyClient.getSelectedContributor = function() {
    // see if the selected object is a job
    var graph = mioarchyClient.editor.editor.graph;
    var selectedGraphObject = graph.selectedGraphObject;

    if (selectedGraphObject && selectedGraphObject.mioObject && selectedGraphObject.mioObject.type === Mioarchy.prototype.Types.Job) {
        var job = selectedGraphObject.mioObject;
        return job.contributor;
    }
    return null;
}

mioarchyClient.clearHighlightedApplicationOverlays = function() {
    // first delete added cells prior to this
    var graph = mioarchyClient.editor.editor.graph;
    var tempCells = mioarchyClient.temporaryApplicationHightedCells;
    if (tempCells) {
        // highlight the jobs this person has taken on
        graph.getModel().beginUpdate();
        try {
            for (var i = 0; i < tempCells.length; i++) {
                graph.getModel().remove(tempCells[i]);
            }
        } finally {
            graph.getModel().endUpdate();
        }
    }
    mioarchyClient.temporaryApplicationHightedCells = [];
}

mioarchyClient.loadUserImgSrc = function(email, targetContainer) {
    mioarchyClient.getUserPhotoUrl(email, function(response) {
        var img = document.createElement("img");
        img.src = response;
        img.width = 96;
        img.height = 96;
        img.style.borderColor = "#3F403F";
        img.style.padding = "3px";
        //img.style.borderRadius = "50%";
        img.style.borderRadius = "5px";
        img.style.borderStyle = "solid";
        img.style.borderWidth = "1px";
        //img.style.borderRadius = "50%";
        //img.style.borderRadius = "5px";
        targetContainer.appendChild(img);
    })
}

mioarchyClient.renderHighlightedApplicationOverlays = function () {
    // if a contributor is selected, don't draw the global overlay view of applications
    // don't highlight anything by default
    var selectedContributor = mioarchyClient.getSelectedContributor();
    if (selectedContributor) {
        //console.log("renderHighlightedApplicationOverlays: contributor is currently selected, not rendering.");
        return;
    }
    var applicationName = mioarchyClient.selectedApplicationName;
    if (typeof(applicationName) == 'undefined' || applicationName === "All Applications") {
        return;
    }

    var graph = mioarchyClient.editor.editor.graph;
    mioarchyClient.clearHighlightedApplicationOverlays();

    // don't highlight anything by default
    if (applicationName === "All Applications") {
        mioarchyClient.selectedApplicationName = null;
        return;
    }

    // obtain our application reference
    var application = mioarchyClient.mioarchy.applications[applicationName];

    // determine application's org dependency graph (how it implements itself)
    var subordinatesTree = mioarchyClient.mioarchy.getApplicationSubordinatesTree(
        applicationName, application.parentOrg
    );

    // the parent organization of this application
    var parentOrgVertex = mioarchyClient.mioarchy.orgToVertex[ application.name ];
    if (typeof(parentOrgVertex) == 'undefined') {
        console.error("Could not find organization for: " + applicationName + " (parentOrgVertex is undefined)");
    }

    // highlight the jobs this person has taken on
    var appColor = mioarchyClient.mioarchy.applications[applicationName].color;

    // keeps track of connections so we don't duplicate reporting lines
    var jobIsConnectedToOrg = [];

    // recursively draw the nodes (clojure will take care of scope)
    var drawingFunction = function(node, lastSubordinateOrgParentVertex) {
        // draw at this level
        graph.getModel().beginUpdate();
        try {
            //==============================================================================================
            //	APP-CONTRIBUTOR RELATIONSHIP HIGHLIGHTING
            //==============================================================================================
            // highlight contributors at this level
            var parent = graph.getDefaultParent();
            for (var i = 0; i < node.matchingJobs.length; i++) {

                // see what organization is selected, and make sure this job is a child of that
                // otherwise when zoomed in to one org, we render highlights for other organizations
                var jobIsWithinThisOrg = false;
                var selectedOrgName = mioarchyClient.targetRenderingOrg;
                if (selectedOrgName) {
                    var org = mioarchyClient.mioarchy.organizations[selectedOrgName];
                    var orgJobs = mioarchyClient.mioarchy.getOrganizationJobs(org, true);
                    for (var j = 0; j < orgJobs.length; j++) {
                        if (orgJobs[j] === node.matchingJobs[i]) {
                            jobIsWithinThisOrg = true;
                            break;
                        }
                    }
                }
                if (jobIsWithinThisOrg) {
                    var jobVertex = mioarchyClient.mioarchy.jobToVertex[node.matchingJobs[i]];
                    var ow = jobVertex.geometry.width;
                    var oh = jobVertex.geometry.width;
                    var w = ow * 2;
                    var h = oh * 2;
                    var x = jobVertex.geometry.x - (w - ow) / 2;
                    var y = jobVertex.geometry.y - (h - oh) / 2;

                    // draw the highlight circle
                    var v = graph.insertVertex(parent, null, "", x, y, w, h,
                        "ellipse;whiteSpace=wrap;html=1;strokeWidth=10;plain-green;fillColor=" + appColor + ";" +
                        "strokeColor=none;shadow=0;gradientColor=none;opacity=50;");

                    var tempCells = mioarchyClient.temporaryApplicationHightedCells;
                    tempCells.push(v);
                    // send to back
                    graph.cellsOrdered([v], true);

                    // check which orgs are connected, and link them
                    var jobId = jobVertex.mioObject.id;
                    var accountabilities = mioarchyClient.mioarchy.jobAccountabilities[jobId];
                    for (var j = 0; j < accountabilities.length; j++) {
                        var a = accountabilities[j];

                        // typeof(jobIsConnectedToOrg[jobId]) == 'undefined'

                        if (a.organization  && a.application == applicationName) {
                            // note the connection about to be made
                            if (typeof(jobIsConnectedToOrg[jobId]) == 'undefined') {
                                jobIsConnectedToOrg[jobId] = [];
                            }
                            jobIsConnectedToOrg[jobId][a.organization] = true;

                            var orgVertex = mioarchyClient.mioarchy.orgToVertex[a.organization];

                            // make the connection
                            // if this is the app node, draw it from the bottom of the app.
                            style = "curved=0;rounded=0;html=1;exitX=0.5;exitY=0;entryX=0.5;entryY=0;";
                            if (parentOrgVertex == lastSubordinateOrgParentVertex) {
                                style = "curved=0;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;";
                            }

                            // also draw a link from the last containing org to this job
                            var e = graph.insertEdge(parent, null, "", v, orgVertex,
                                style + "strokeWidth=10;strokeColor=" + appColor + ";opacity=50");
                            tempCells.push(e);
                            // send to back
                            graph.cellsOrdered([e], true);
                        }
                    }
                }
            }
        } finally {
            graph.getModel().endUpdate();
        }
        // next, recurse on the kids
        // connect the org with sub orgs that match
        for (var i = 0; i < node.children.length; i++) {
            var newParentVertex = lastSubordinateOrgParentVertex;
            if (node.children[i].hasAccountabilities) {
                // new parent vertex to pass down to drawing recursion function
                var childOrgName = node.children[i].name;
                newParentVertex = mioarchyClient.mioarchy.orgToVertex[ childOrgName ];
            }
            // recurse, providing a new parent vertex to draw edges from
            drawingFunction.call( this, node.children[i], newParentVertex );
        }
    }
    drawingFunction.call( this, subordinatesTree, parentOrgVertex ); // draw the root, which will draw the rest recursively
}

mioarchyClient.getContributorJobs = function(contributorName) {
    // find all this person's jobs
    var contributor = mioarchyClient.mioarchy.contributors[contributorName];
    var jobList = [];
    for (j in mioarchyClient.mioarchy.jobs) {
        if (mioarchyClient.mioarchy.jobs[j].contributor.toLowerCase()
            === contributor.name.toLowerCase()) {
            jobList.push(j);
        }
    }
    return jobList;
}

mioarchyClient.clearHighlights = function() {
    mioarchyClient.clearHighlightContributorJobs();
    mioarchyClient.clearContributorAccountabilityHighlighting();
    mioarchyClient.clearHighlightedApplicationOverlays();
}

mioarchyClient.clearHighlightContributorJobs = function() {
    var graph = mioarchyClient.editor.editor.graph;
    // first unselect all the other selected jobs
    if (mioarchyClient.temporaryContributorHightedCells) {
        graph.getModel().beginUpdate();
        try {
            for (var i = 0; i < mioarchyClient.temporaryContributorHightedCells.length; i++) {
                graph.getModel().remove(mioarchyClient.temporaryContributorHightedCells[i]);
            }
        } finally {
            graph.getModel().endUpdate();
        }
    }
    mioarchyClient.temporaryContributorHightedCells = [];
}

mioarchyClient.highlightContributorJobs = function(contributorName) {
    var graph = mioarchyClient.editor.editor.graph;
    mioarchyClient.clearHighlightContributorJobs();

    // find all this person's jobs
    var jobList = mioarchyClient.mioarchy.getContributorJobs( contributorName );
    var highlightColor = "magenta";

    // highlight the jobs this person has taken on
    graph.getModel().beginUpdate();
    try {
        var parent = graph.getDefaultParent();
        for (var i = 0; i < jobList.length; i++) {
            // only render if on screen
            var isVisible = mioarchyClient.isJobWithinSelectedOrg( jobList[i] );
            if (isVisible) {
                var jobVertex = mioarchyClient.mioarchy.jobToVertex[jobList[i]];

                var ow = jobVertex.geometry.width;
                var oh = jobVertex.geometry.width;
                var w = ow * 2;
                var h = oh * 2;
                var x = jobVertex.geometry.x - (w - ow) / 2;
                var y = jobVertex.geometry.y - (h - oh) / 2;

                var v = graph.insertVertex(parent, null, "", x, y, w, h,
                    "ellipse;whiteSpace=wrap;html=1;strokeWidth=10;plain-green;fillColor=none;" +
                    "strokeColor=" + highlightColor + ";shadow=0;gradientColor=none;opacity=50;");
                mioarchyClient.temporaryContributorHightedCells.push(v);
                // move the highlighted region to the back
                graph.orderCells(true, v);
            }
        }

        // fully connect the graph with edges
        var numVertices = mioarchyClient.temporaryContributorHightedCells.length;
        for (var i = 0; i < numVertices; i++) {
            for (var j = 0; j < numVertices/2; j++) {
                if (i != j) {
                    var v1 = mioarchyClient.temporaryContributorHightedCells[i];
                    var v2 = mioarchyClient.temporaryContributorHightedCells[j];

                    var v = graph.insertEdge(parent, null, "", v1, v2,
                        "edgeStyle=none;dashPattern=1 4;endArrow=none;dashed=1;rounded=0;html=1;" +
                        "exitX=1;exitY=0.5;entryX=0.5;entryY=1;" +
                        "strokeWidth=5;strokeColor=gray;opacity=50");

                    /*var v = graph.insertEdge(parent, null, "", v1, v2,
                     "edgeStyle=orthogonalEdgeStyle;curved=1;rounded=0;html=1;" +
                     "exitX=1;exitY=0.5;entryX=0.5;entryY=1;" +
                     "strokeWidth=5;strokeColor="+highlightColor+";opacity=50");*/
                    mioarchyClient.temporaryContributorHightedCells.push(v);
                }
            }
        }

    } finally {
        graph.getModel().endUpdate();
    }
}

mioarchyClient.highlightJobAccountabilities = function(jobId) {
    //var filteringApplication = mioarchyClient.getSelectedApplication();
    var graph = mioarchyClient.editor.editor.graph;

    // each accountability that points at an organization should be highlighted

    // get the list of accountabilities first
    graph.getModel().beginUpdate();
    var accountabilities = mioarchyClient.mioarchy.jobAccountabilities[jobId];
    try {
        for (var a in accountabilities) {
            var acc = accountabilities[a];
            var orgName = acc.organization;
            var appName = acc.application;

            var selectedApp = mioarchyClient.getSelectedApplication();
            if (selectedApp && (selectedApp !== appName)) {
                continue; // skip this one, since we are filtering by the global app selector drop-down
            }

            if (mioarchyClient.isOrgWithinSelectedOrg(orgName)) {
                var jobVertex = mioarchyClient.mioarchy.jobToVertex[jobId];
                var orgVertex = mioarchyClient.mioarchy.orgToVertex[orgName];

                // make the connection
                var style = "curved=0;rounded=0;html=1;exitX=0.5;exitY=0;entryX=0.5;entryY=0;";

                var appColor = appName ? mioarchyClient.mioarchy.applications[appName].color : "gray";
                var parent = graph.getDefaultParent();

                // also draw a link from the last containing org to this job
                var e = graph.insertEdge(parent, null, "", jobVertex, orgVertex,
                    style + "strokeWidth=10;strokeColor=" + appColor + ";opacity=50");
                mioarchyClient.temporaryContributorAccountabilityHighlightedCells.push(e);
                // send to back
                graph.cellsOrdered([e], true);
            }
        }
    } finally {
        graph.getModel().endUpdate();
    }
}

mioarchyClient.getSelectedApplication = function() {
    // is there a filtering app?
    var applicationName = mioarchyClient.selectedApplicationName;
    if (typeof(applicationName) == 'undefined' || applicationName === "All Applications") {
        applicationName = null;
    }
    return applicationName;
}

mioarchyClient.clearContributorAccountabilityHighlighting = function() {
    var graph = mioarchyClient.editor.editor.graph;

    // first unselect all the other selected jobs
    if (mioarchyClient.temporaryContributorAccountabilityHighlightedCells) {
        graph.getModel().beginUpdate();
        try {
            for (var i = 0; i < mioarchyClient.temporaryContributorAccountabilityHighlightedCells.length; i++) {
                graph.getModel().remove(mioarchyClient.temporaryContributorAccountabilityHighlightedCells[i]);
            }
        } finally {
            graph.getModel().endUpdate();
        }
    }
    mioarchyClient.temporaryContributorAccountabilityHighlightedCells = [];
}

mioarchyClient.isJobWithinSelectedOrg = function(jobId) {
    // see what organization is selected, and make sure this job is a child of that
    // otherwise when zoomed in to one org, we render highlights for other organizations
    var selectedOrgName = mioarchyClient.targetRenderingOrg;
    if (selectedOrgName) {
        var org = mioarchyClient.mioarchy.organizations[selectedOrgName];
        var orgJobs = mioarchyClient.mioarchy.getOrganizationJobs(org, true);
        for (var j = 0; j < orgJobs.length; j++) {
            if (orgJobs[j] === jobId) {
                return true;
            }
        }
    }
    return false;
}

mioarchyClient.isOrgWithinSelectedOrg = function(orgName) {
    // see what organization is selected, and make sure this job is a child of that
    // otherwise when zoomed in to one org, we render highlights for other organizations
    var jobIsWithinThisOrg = false;
    var selectedOrgName = mioarchyClient.targetRenderingOrg;
    // it's contained since it's the same
    if (mioarchyClient.targetRenderingOrg == orgName) {
        return true;
    }

    // it's contained because it's a descendant
    return mioarchyClient.mioarchy.isDescendantOfOrganization(
        mioarchyClient.mioarchy.organizations[orgName],
        mioarchyClient.mioarchy.organizations[mioarchyClient.targetRenderingOrg]);
}

mioarchyClient.renderHighlightedContributorOverlays = function () {
    // don't highlight anything by default
    var selectedContributor = mioarchyClient.getSelectedContributor();
    if (selectedContributor) {
        // show the circles around each of the jobs taken on by this person
        mioarchyClient.highlightContributorJobs(selectedContributor);
        mioarchyClient.clearContributorAccountabilityHighlighting();

        var jobs = mioarchyClient.mioarchy.getContributorJobs(selectedContributor);
        for (var j in jobs) {
            var jobId = jobs[j];
            if (mioarchyClient.isJobWithinSelectedOrg(jobId)) {;
                mioarchyClient.highlightJobAccountabilities(jobId);
            }
        }
    } else {
        //console.log("no selected contributor detector");
    }
}

mioarchyClient.initializeToolbar = function() {
    if (typeof(mioarchyClient.toolbarInitialized) == 'undefined') {

        var appListElt = document.getElementById("mioarchy-application-list");
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#";
        a.innerText = "All Applications";
        a.onclick = function() {
            mioarchyClient.handleApplicationFilterSelectionChange(this.innerText);
        }
        li.appendChild(a);
        appListElt.appendChild(li);
        li = document.createElement("li");
        li.role = "separator";
        li.class = "divider";
        appListElt.appendChild(li);
        var applicationList = Object.keys(mioarchyClient.mioarchy.applications);
        for (var i = 0; i < applicationList.length; i++) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "#";
            a.innerText = applicationList[i];
            a.onclick = function() {
                mioarchyClient.handleApplicationFilterSelectionChange(this.innerText);
            }
            li.appendChild(a);
            appListElt.appendChild(li);
        }

        /*
         var elts = this.addItems(['actualSize', 'zoomIn', 'zoomOut', '-']);
         elts[0].setAttribute('title', mxResources.get('actualSize') + ' (Ctrl+0)');
         elts[1].setAttribute('title', mxResources.get('zoomIn') + ' (Ctrl + / Alt+Scroll)');
         this.addSeparator();
         */

        $('#selectedDatePicker').datepicker({ autoclose:true  });
        document.getElementById('selectedDatePicker').onchange = function(evt) {
            var date = evt.target.value;
            mioarchyClient.activeTransformation = { startDate:date, endDate:date };
            mioarchyClient.renderOrganization();
        }
        $("#nextKeyFrameButton").click(function() {
            mioarchyClient.incrementKeyFrameIndexBy(1);
        });
        $("#prevKeyFrameButton").click(function() {
            mioarchyClient.incrementKeyFrameIndexBy(-1);
        });

        mioarchyClient.toolbarInitialized = true;
    }
}

mioarchyClient.updateAfterKeyFrameJump = function() {
    var date = mioarchyClient.getFilterDateFromCurrentKeyFrameIndex();
    document.getElementById('selectedDatePicker').value = date;
    mioarchyClient.activeTransformation = { startDate:date, endDate:date };
    mioarchyClient.render();
}

mioarchyClient.incrementKeyFrameIndexBy = function(x) {
    var keys = Object.keys(mioarchyClient.mioarchyCachedModel.timelineEventIndex);
    mioarchyClient.currentKeyFrameIndex += x;
    if (mioarchyClient.currentKeyFrameIndex < 0) {
        mioarchyClient.currentKeyFrameIndex = 0;
    } else if (mioarchyClient.currentKeyFrameIndex > keys.length - 1) {
        mioarchyClient.currentKeyFrameIndex = keys.length - 1;
    }
    // ** re-render **
    mioarchyClient.updateAfterKeyFrameJump();
}

mioarchyClient.currentKeyFrameIndex = 0;

mioarchyClient.getFilterDateFromCurrentKeyFrameIndex = function() {
    return Object.keys( mioarchyClient.mioarchyCachedModel.timelineEventIndex ) [ mioarchyClient.currentKeyFrameIndex];
}

/* gets the closes keyframe before today's date
 * precondition: keyframes are sorted */
mioarchyClient.getKeyIndexClosestToToday = function() {
    var today = Date.now();
    var keys = Object.keys(mioarchyClient.mioarchyCachedModel.timelineEventIndex);
    var k = 0;
    var candidateKeyDate = keys[k];
    var closestKeyDate;
    var closestKeyIndex;
    while (new Date(candidateKeyDate) < today) {
        closestKeyDate = candidateKeyDate;
        closestKeyIndex = k;
        candidateKeyDate = keys[++k];
    }
    return closestKeyIndex;
}
