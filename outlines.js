/**
 * The $P Point-Cloud Recognizer (JavaScript version)
 *
 * 	Radu-Daniel Vatavu, Ph.D.
 *	University Stefan cel Mare of Suceava
 *	Suceava 720229, Romania
 *	vatavu@eed.usv.ro
 *
 *	Lisa Anthony, Ph.D.
 *      UMBC
 *      Information Systems Department
 *      1000 Hilltop Circle
 *      Baltimore, MD 21250
 *      lanthony@umbc.edu
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 * The academic publication for the $P recognizer, and what should be
 * used to cite it, is:
 *
 *	Vatavu, R.-D., Anthony, L. and Wobbrock, J.O. (2012).
 *	  Gestures as point clouds: A $P recognizer for user interface
 *	  prototypes. Proceedings of the ACM Int'l Conference on
 *	  Multimodal Interfaces (ICMI '12). Santa Monica, California
 *	  (October 22-26, 2012). New York: ACM Press, pp. 273-280.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (c) 2012, Radu-Daniel Vatavu, Lisa Anthony, and
 * Jacob O. Wobbrock. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University Stefan cel Mare of Suceava,
 *	University of Washington, nor UMBC, nor the names of its contributors
 *	may be used to endorse or promote products derived from this software
 *	without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Radu-Daniel Vatavu OR Lisa Anthony
 * OR Jacob O. Wobbrock BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 **/
(function(){

    //
    // Point class
    //

    // constructor
    function Point(x, y, id) {
        this.X = x;
        this.Y = y;
        this.ID = id; // stroke ID to which this point belongs (1,2,...)
    }

    //
    // PointCloud class: a point-cloud template
    //

    // constructor
    function PointCloud(name, points) {
        this.Name = name;

        this.Points = Normalize(points);
    }
    //
    // Result class
    //

    // constructor
    function Result(name, score) {
        this.Name = name;
        this.Score = score;
    }

    //
    // Recognizer class constants
    //
    var NumPoints = 32;
    var Origin = new Point(0,0,0);
    //
    // Recognizer class
    //

    //constructor
    function Recognizer(gestures) {
        //
        // one predefined point-cloud for each gesture
        //
        this.PointClouds = [];

        /*
         * The $P Point-Cloud Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), DeleteUserGestures()
         */
        this.Recognize = function(points)
        {
            points = Normalize(points);

            var b = +Infinity;
            var u = -1;
            for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
            {
                var d = GreedyCloudMatch(points, this.PointClouds[i]);
                if (d < b) {
                    b = d; // best (least) distance
                    u = i; // point-cloud
                }
            }
            // return (u == -1) ? new Result("No match.", 0.0) : new Result(this.PointClouds[u].Name, Math.max((b - 2.0) / -2.0, 0.0));
            return (u == -1) ? new Result(null, 0.0) : new Result(this.PointClouds[u].Name, Math.max((b - 2.0) / -2.0, 0.0));
        };

        /*
         * Similar to Recognize() but instead of returning the closest match, instead it
         * returns a list of matches sorted by the closest match to the farthest
         */
        this.Rank = function(points)
        {
            points = Normalize(points);

            // For each point-cloud template
            var matches = [];
            for (var i = 0; i < this.PointClouds.length; i++) {
                var d = GreedyCloudMatch(points, this.PointClouds[i]);
                matches.push( new Result(this.PointClouds[i].Name, Math.max((d - 2.0) / -2.0, 0.0)) );
            }

            // Sort by score
            matches.sort( function(a, b){
                if(a.Score > b.Score){
                    return -1;
                } else if(a.Score < b.Score){
                    return 1;
                } else {
                    return 0;
                }
            });

            return matches;
        };
    }
    //
    // Private helper functions from this point down
    //
    function GreedyCloudMatch(points, P) {
        var e = 0.50;
        var step = Math.floor(Math.pow(points.length, 1 - e));
        var min = +Infinity;
        for (var i = 0; i < points.length; i += step) {
            var d1 = CloudDistance(points, P.Points, i);
            var d2 = CloudDistance(P.Points, points, i);
            min = Math.min(min, Math.min(d1, d2)); // min3
        }
        return min;
    }

    function CloudDistance(pts1, pts2, start) {
        var matched = new Array(pts1.length); // pts1.length == pts2.length
        for (var k = 0; k < pts1.length; k++)
        matched[k] = false;
        var sum = 0;
        var i = start;
        do
        {
            var index = -1;
            var min = +Infinity;
            for (var j = 0; j < matched.length; j++)
            {
                if (!matched[j]) {
                    var d = Distance(pts1[i], pts2[j]);
                    if (d < min) {
                        min = d;
                        index = j;
                    }
                }
            }
            matched[index] = true;
            var weight = 1 - ((i - start + pts1.length) % pts1.length) / pts1.length;
            sum += weight * min;
            i = (i + 1) % pts1.length;
        } while (i != start);
        return sum;
    }

    /*
     * Gesture points are resampled, scaled with shape preservation, and translated to origin.
     */
    function Normalize(points, shouldResample){
        if(typeof(shouldResample) === "undefined") shouldResample = true;
        if(shouldResample) {
            points = Resample(points, NumPoints);
        }
        points = Scale(points);
        points = TranslateTo(points, Origin);
        return points;
    };

    function clonePoints(points){
        var newPoints = [];
        points.forEach(function(pt){
            newPoints.push(new Point(pt.X, pt.Y, pt.ID));
        });
        return newPoints;
    }

    function Resample(points, n) {
        points = clonePoints(points);
        var I = PathLength(points) / (n - 1); // interval length
        var D = 0.0;
        var newpoints = new Array( new Point(points[0].X, points[0].Y, points[0].ID) );
        for (var i = 1; i < points.length; i++)
        {
            if (points[i].ID == points[i-1].ID)
                {
                    var d = Distance(points[i - 1], points[i]);
                    if ((D + d) >= I)
                        {
                            var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
                            var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
                            var q = new Point(qx, qy, points[i].ID);
                            newpoints[newpoints.length] = q; // append new point 'q'
                            points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
                            D = 0.0;
                        }
                        else D += d;
                }
        }
        if (newpoints.length == n - 1) // sometimes we fall a rounding-error short of adding the last point, so add it if so
            newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].ID);
        return newpoints;
    }

    // Scale the points so they are in a normalized box with x & y = [0,1]. This makes
    // comparing gestures against point clouds scale invariant
    function Scale(points) {

        // Find the bounding box of points
        var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
        for (var i = 0; i < points.length; i++) {
            minX = Math.min(minX, points[i].X);
            minY = Math.min(minY, points[i].Y);
            maxX = Math.max(maxX, points[i].X);
            maxY = Math.max(maxY, points[i].Y);
        }

        // Figure out the max dimension (either the width or height is biggest)
        var size = Math.max(maxX - minX, maxY - minY);

        // Scale points down into a square of 1.0 x 1.0 dimensions, while maintaining
        // x/y proportions
        var newpoints = new Array();
        for (var i = 0; i < points.length; i++) {
            var qx = (points[i].X - minX) / size;
            var qy = (points[i].Y - minY) / size;
            newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
        }
        return newpoints;
    }

    // Translates points' so that their average position becomes the origin (ie the PointCloud's
    // points are centered around the origin)
    //
    // NOTE: It seems the pt parameter is redundant as it's always passed an 0,0 vector
    // which makes it have no effect when adding it's components below
    function TranslateTo(points, pt) {
        var c = Centroid(points);
        var newpoints = new Array();
        for (var i = 0; i < points.length; i++) {
            var qx = points[i].X + pt.X - c.X;
            var qy = points[i].Y + pt.Y - c.Y;
            newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
        }
        return newpoints;
    }

    // Compute the average position of all the points
    function Centroid(points) {
        var x = 0.0, y = 0.0;
        for (var i = 0; i < points.length; i++) {
            x += points[i].X;
            y += points[i].Y;
        }
        x /= points.length;
        y /= points.length;
        return new Point(x, y, 0);
    }

    // length traversed by a point path
    function PathLength(points) {
        var d = 0.0;
        for (var i = 1; i < points.length; i++)
        {
            if (points[i].ID == points[i-1].ID)
                d += Distance(points[i - 1], points[i]);
        }
        return d;
    }

    // Euclidean distance between two points
    function Distance(p1, p2) {
        var dx = p2.X - p1.X;
        var dy = p2.Y - p1.Y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    var outlines = {
        Point: Point,
        Recognizer: Recognizer,
        PointCloud: PointCloud,
        Normalize: Normalize,
        PathLength: PathLength,
    };

    if ( typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
        module.exports = outlines;
    } else {
        window.outlines = outlines;
    }

})();
