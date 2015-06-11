var EngineStarter = function(){
	
};

EngineStarter.prototype.start = function(){
	var sim_id = localStorage.getItem("sim_id");
	
	switch(sim_id){
		case 2:
			new PatientEngine();
			break;
		
		default:
			throw "No simulation for sim id" + sim_id + " is set.";
	}	
};