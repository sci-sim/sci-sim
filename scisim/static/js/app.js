var tf = new TemplateFiller();
var loader = new Loader();
var api = new API();
var ps = new PageSwitcher();
var publisher = new EventPublisher();
var chain = new PageChain();
var renderer = new PageRenderer();
var DOMHelper = new DOMHelper();
var storageHelper = new LocalStorageHelper();
var playerFactory = new AudioPlayerFactory();

var labnotebook = new LabNotebook($('.labenotebook'));
localStorage.clear();
localStorage.setItem("choices_made", JSON.stringify([]));

window.onbeforeunload = function(){
	return "If you leave this page, you'll lose all you have so far!";
}

$("#labNotebookToggle").click(function(e){
	if(e.target === this){
		labnotebook.toggle();
	}
});

new SimulationController(); // this kicks everything else off

publisher.subscribe("changePage", function(ctlr, param){
	new ctlr(param);
}, true);
