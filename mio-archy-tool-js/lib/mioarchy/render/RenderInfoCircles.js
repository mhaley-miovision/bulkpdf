'use strict';

function RenderInfoCircles(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle)
{
    var calculatedLocations = RenderingUtilities.calculateCircleLocations(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle);
    this.width = calculatedLocations.width;
    this.height = calculatedLocations.height;
    this.circleCenters = calculatedLocations.circleCenters;

    /*
     // circle coordinates need to be offset to be translated to have 0,0 as the top-left
     var dx = this.width / 2 + circleDiameter / 2;
     var dy = this.height / 2 + circleDiameter / 2;
     RenderingUtilities.translatePoints(this.circleCenters, dx, dy);*/
}
RenderInfoCircles.prototype = {};