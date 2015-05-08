var tf = new TemplateFiller();
var loader = new Loader();
var api = new API();
var ps = new PageSwitcher();
var publisher = new EventPublisher();

new SimulationController(); // this kicks everything else off

publisher.subscribe("changePage", function(ctlr, param){
	new ctlr(param);
}, true);
