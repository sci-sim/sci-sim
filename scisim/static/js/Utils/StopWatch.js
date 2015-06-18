/**
 * Super simple StopWatch implementation for determining time spent on page.
 */
var StopWatch = function() {
    // room to increase functionality if needed.
    this.start();
};

StopWatch.prototype.start = function() {
    this.start_time = new Date();
};

/**
 * Stops timer
 * @return {int} number of seconds since stopwatch was started.
 */
StopWatch.prototype.stop = function() {
    var stop_time = new Date();
    var time_delta = stop_time - this.start_time;
    this.start_time = new Date();
    return Math.round(time_delta / 1000) ;
};
