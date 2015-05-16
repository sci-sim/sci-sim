var Library = function($selector){
	this.$list = $selector;
	this.$list.addClass("hidden"); // TODO: find a way to inherit while executing the constructor
};


Library.prototype = Object.create(ListContainer.prototype);