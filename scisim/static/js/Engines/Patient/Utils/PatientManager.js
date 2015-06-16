var PatientManager = function(){
	this.patients = [];	
};

PatientManager.prototype.discover = function(){
	var id = null;
	var that = this;
	
	DOMHelper.iterateContentSections(function(){
		var text = $(this).text();
		if(text.search("Mr") > 0 || text.search("Ms") > 0){
			var split = text.split(" "),
		 		name = split.splice(split.length - 2).join(" ").replace(/(<([^>]+)>)/ig,"");
			
			var patient = new Patient(name); // how do we tell if the patient is already in the list?
			id = patient.id;
			that.patients.push(patient);	
		}
	});
	
	return id;
};

PatientManager.prototype.getPatient = function(id){
	for (var i = 0; i < this.patients.length; i++) {
		if(this.patients[i].id === id) return this.patients[i];
	}
	
	return false;
};