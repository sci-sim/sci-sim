var PatientManager = function(){
	this.patients = [];	
};

PatientManager.prototype.discoverFromDOM = function(){
	var that = this;
	
	DOMHelper.iterateContentSections(function(el){
		var text = $(el).text();
		var patient = that.discover(text);
		if (patient) {
			that.patients.push(patient);
		}
	});
	
	return patient;
};

PatientManager.prototype.discoverFromResponse = function (sections) {
	for (var i = 0; i < sections.length; i++) {
		var text = $(sections[i].content).text();
		var patient = this.discover(text);
		
		if(patient) break;
	}
	
	return patient;
};

PatientManager.prototype.discover = function (text) {
	if(text.search("Mr") > 0 || text.search("Ms") > 0){
		var split = text.split(" "),
	 		name = split.splice(split.length - 2).join(" ").replace(/(<([^>]+)>)/ig,"");
		
		return new Patient(name); // how do we tell if the patient is already in the list?
	}
	
	return null;
};

PatientManager.prototype.getPatient = function(id){
	for (var i = 0; i < this.patients.length; i++) {
		if(this.patients[i].id === id) return this.patients[i];
	}
	
	return false;
};