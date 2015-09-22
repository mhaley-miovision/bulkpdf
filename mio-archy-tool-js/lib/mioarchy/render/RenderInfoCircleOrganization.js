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