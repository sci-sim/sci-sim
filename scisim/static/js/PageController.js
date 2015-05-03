var PageController = function(){
	this.render();
}

PageController.prototype.render = function() {
	api.getPage(page_id).done(function(response){
		if($.isEmptyObject(response)){
			alert("this page doesn't work");
		}else{
			
		}
	});
};

PageController.prototype.init = function() {
	
};