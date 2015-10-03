var EngineStarter = function(){
	this.start();
};

EngineStarter.prototype.start = function(){
    if(storageHelper.get('is_admin')){
        new AdminEngine();
        return;
    }

    var sim_id = storageHelper.get(("sim_id"));

	switch(sim_id){
		case 2:
			new PatientEngine();
			break;
		
		default:
            new PatientEngine();
            //throw "No simulation for sim id" + sim_id + " is set.";
	}	
};