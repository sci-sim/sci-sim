var EngineStarter = function(){
	this.start();
};

EngineStarter.prototype.start = function(){
	var sim_id = parseInt(localStorage.getItem("sim_id"));
		
	switch(sim_id){
		case 2:
			new PatientEngine();
			break;
		case 3:
		
		
		default:
			throw "No simulation for sim id" + sim_id + " is set.";
	}	
};