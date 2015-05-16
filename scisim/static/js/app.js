var tf = new TemplateFiller();
var loader = new Loader();
var api = new API();
var ps = new PageSwitcher();
var publisher = new EventPublisher();
var chain = new PageChain();
var labnotebook = new LabNotebook($('.labenotebook'));
var library = new Library($('.library'));

$("#libraryToggle").click(function(e){
	if(e.target === this){
		library.toggle();	
	}
});

$("#labNotebookToggle").click(function(e){
	if(e.target === this){
		labnotebook.toggle();	
	}
});

new SimulationController(); // this kicks everything else off

publisher.subscribe("changePage", function(ctlr, param){
	new ctlr(param);
}, true);