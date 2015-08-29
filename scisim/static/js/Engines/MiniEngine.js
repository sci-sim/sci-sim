var MiniEngine = function (d) {
    this.deferred = d;
};


MiniEngine.prototype.finish = function(obj){
    this.deferred.resolve(obj || null);
};