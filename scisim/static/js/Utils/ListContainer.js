var ListContainer = function($selector){
		this.$list = $selector; 
};

ListContainer.prototype.add = function(text) {
	var newItem = $("<li></li>").text(text);
	this.$list.append(newItem);
};

ListContainer.prototype.toggle = function(){
	if(this.$list.hasClass("hidden")){
		this.$list.removeClass("hidden");
	}else{
		this.$list.addClass("hidden");
	}
};