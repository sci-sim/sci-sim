var Engine = function () {};

Engine.prototype.startMiniEngine = function(engine){
    var $d = $.Deferred();

    new engine($d);

    return $d;
};