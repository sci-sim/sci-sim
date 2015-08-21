var LocalStorageHelper = function(){};

LocalStorageHelper.prototype.store = function(name, value){
	localStorage.setItem(name, value);	
};

LocalStorageHelper.prototype.get = function(name){
	return localStorage.getItem(name);
};

LocalStorageHelper.prototype.initJsonArray = function(name){
	this.store(name, JSON.stringify([]));
};

LocalStorageHelper.prototype.appendJsonArray = function(name, value){
	var data = JSON.parse(this.get(name));
	
	if(!isNaN(value)) value = parseInt(value);
	data.push(value);
	
	var stringified = JSON.stringify(data);
	
	this.store(name, stringified);
};

LocalStorageHelper.prototype.getJson = function(name){
	return JSON.parse(this.get(name));
}