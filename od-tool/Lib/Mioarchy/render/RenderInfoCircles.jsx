'use strict';

function RenderInfoCircles(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle)
{
    var calculatedLocations = RenderingUtilities.calculateCircleLocations(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle);
    this.width = calculatedLocations.width;
    this.height = calculatedLocations.height;
    this.circleCenters = calculatedLocations.circleCenters;
}
RenderInfoCircles.prototype = {};