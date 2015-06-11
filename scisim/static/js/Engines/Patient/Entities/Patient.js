var Patient = function(name){
	this.name = name;
	this.choices = [];	
	this.id = Math.floor(Math.random() * 100000000000);
};