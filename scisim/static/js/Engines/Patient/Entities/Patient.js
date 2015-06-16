var Patient = function(name){
	this.name = name;
	this.choices = [];	
	this.modifiers = [];
	this.id = Math.floor(Math.random() * 100000000000);
};