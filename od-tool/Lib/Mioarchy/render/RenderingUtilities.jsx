'use strict';

function RenderingUtilities() {
}

// Generates a group of circle locations, with a minimum distance between the circles
RenderingUtilities.calculateCircleLocations = function(numCircles, minDistanceBetweenCircles, circleDiameter, useMiddle) {
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
    // will populate resulting object
    var width = 0;
    var height = 0;
    var circleCenters;

    // base cases
    if (numCircles <= 0) {
        width = 0;
        height = 0;
        circleCenters = [{}];
    }
    else if (numCircles == 1) {
        width = circleDiameter;
        height = circleDiameter;
        circleCenters = [{x: 0, y: 0}];
    } else {
        circleCenters = [];

        if (useMiddle) {
            // first circle is in the middle
            circleCenters[0] = {x: 0, y: 0};
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
                Nc_current = 1 + Math.floor(2 * Math.PI / alpha_min);
                alpha = 2 * Math.PI / Nc_current; // override alpha in case of error due to approximation used
            } else {
                Nc_current = Nc_remaining;
            }

            // now draw the # of circles, given alpha
            for (var i = 0; i < Nc_current; i++) {
                var angle = alpha * i;
                var newX = x + R * Math.cos(angle);
                var newY = y + R * Math.sin(angle);
                var p = {x: newX, y: newY};
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
    return {
        width: width, height: height, circleCenters: circleCenters
    };
};

// Moves a list of points by dx,dy
RenderingUtilities.translatePoints = function(points, dx, dy) {
    var pointsTranslated = [];
    for (var p in points) {
        pointsTranslated.push( { x: points[p].x + dx, y: points[p].y + dy } );
    }
    return pointsTranslated;
};

RenderingUtilities.calculateBoundingCircleDiameter = function(width, height) {
    return Math.sqrt( width*width + height*height );
};