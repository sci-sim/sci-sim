// handles the interactions between the user and pages
var PatientEngine = function(){
		this.renderPage(localStorage.getItem("first_page_id"));
};

PatientEngine.prototype.renderPage = function(page_id){
	pageRenderer.render(page_id).done(function(context){
		
	});
};