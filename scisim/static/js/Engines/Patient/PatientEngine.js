// handles the interactions between the user and pages
var PatientEngine = function(){
		this.renderPage(localStorage.getItem("first_page_id"));
};

PatientEngine.prototype.renderPage = function(page_id){
	PageRenderer.render(page_id).done(function(context){
		var patientID = PatientManager.discover;
		new PatientPageDirectiveApplicator(context.actions, context.modifiers, PatientManager.getPatient(patientID));
	});
};