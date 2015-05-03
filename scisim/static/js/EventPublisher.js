var EventPublisher = function(){
	this.subscribers = [];
}

EventPublisher.prototype.subscribe = function(eventName, func, recurring) {
	for (var i = 0; i < this.subscribers.length; i++) {
		if(this.subscribers[i][0] === eventName){
			throw "The event " + eventName + " is already in use.";
		}
	};

	if(typeof recurring == "undefined") recurring = false;

	this.subscribers.push({"name": eventName, "func": func, "recurring": recurring});
};

EventPublisher.prototype.publish = function(eventName, params) {
	if(!$.isArray(params)) throw "Params need to be wrapped in an array";

	for (var i = 0; i < this.subscribers.length; i++) {
		if(this.subscribers[i].name === eventName){
			this.subscribers[i].func.apply(null, params); // params needs to be an array
			if(this.subscribers[i].recurring == false) this.subscribers.pop(i);			
		}
		return;
	};
	
	throw "The event " + eventName + " does not exist";
};