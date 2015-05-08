var PageController = function(page_id){
	this.page_id = parseInt(page_id);
	this.render();
}

PageController.prototype.render = function() {
	var that = this;

	api.getPage(this.page_id).done(function(response){
		if($.isEmptyObject(response)){
			alert("this page doesn't exist");
		}else{
			var html = that.composePage(response);
			that.init()
		}
	});
};

PageController.prototype.composePage = function(pageResponse) {
	var sections = pageResponse.sections,
		choices = pageResponse.choices,
	 	html = "";

	 for (var i = 0; i < sections.length; i++) {
	 	html += tf.fillTemplate({"content": sections[i].content}, "page_section");
	 };

	 for (var i = 0; i < choices.length; i++) {
	 	var templateType = "";
	 	switch(choices[i].type){
	 		case "question":
	 			templateType = "question_choice";
	 			break;
	 		case "binary":
	 			templateType = "binary_choice";
	 			break;
	 		case "prompt":
	 			templateType = "prompt_choice";
	 			break;
	 	}

	 	html += tf.fillTemplate({"text": choices[i].text, "id":choices[i].id, "destination": choices[i].destination}, templateType);
	 };

	 html += tf.fillTemplate(null, "submit_btn");

	 ps.transitionPage(html);
};

PageController.prototype.applyDirectives = function(pageResponse) {
	var actions = pageResponse.page_actions,
		modifiers = pageResponse.page_modifiers;

};

PageController.prototype.init = function() {
	var that = this;

	// if they click the button, then they were responding to inputs. otherwise, they were responding to a binary choice.
	$('button').click(this.processButtonClick.bind(this));
	$('.choice-binary').click(this.processBinaryClick.bind(this));

	publisher.subscribe("choiceLimitReached", function(pageId){
		that.disableChoices();
	}, true);
};

PageController.prototype.processButtonClick = function(e) {
	var $inputs = $('input'),
		choicesMade = [],
		destination = "";

	for (var i = 0; i < $inputs.length; i++) {
		var input = $inputs.eq(i);
		var obj = {};

		obj['value'] = input.val();;
		obj['id'] = input.data("choice-id");
		obj['destination'] = input.data("destination");
		destination = obj['destination']; // TODO: we're assuming that all of the inputs have the same destination. Can we assume that?

		obj['action_string'] = "Choice made: " + obj['value'] + "on choice_id: "+ obj['id'] + "which goes to: " + obj['destination'];

		choicesMade.push(obj);
	};

	// we're going to construct this so that later we can make a parser that generates insightful xls documents based on these. 
	var user_ids = JSON.parse(localStorage.getItem("user_id"));

	if(!$.isArray(user_ids)){
		//this means there's just 1 user going through the simulation
		var user_ids = [user_ids];
	}

	var requests = [];
	for (var i = 0; i < user_ids.length; i++) {
		for (var j = 0; j < choicesMade.length; j++) {
			requests.push([this.page_id, user_ids[i], choicesMade[j].action_string]);
		};
		
	};

	this.logActions(requests, destination);
};

PageController.prototype.logActions = function(data, destination) {

	api.aggregateRequests(api.logUserAction, data).then(function(){
		var responses = arguments;
		
		for (var i = 0; i < responses.length; i++) {
			var response = responses[i][0];
			
			if(responses[i].hasOwnProperty('error')){
				console.log("things didn't go well.. " + responses[i].error);
				return; //TODO: provide an error here
			}
		};

		loader.hide();
		publisher.publish('changePage', [PageController, destination]); // assume that that's all we need to do on the page
	});
};

PageController.prototype.disableChoices = function() {
	var choices = $('.choice');
	for (var i = 0; i < choices.length; i++) {
		choices.eq(i).addClass("disabled");
	};
};

function min_choice_modifier(page_id, limit, destination){
	localStorage.setItem("min_choice_watcher_"+page_id, JSON.stringify({"page_id": page_id, "limit": limit, "current": 0, "destination": destination}));

	publisher.subscribe("choiceMade", function(page_id){
		if(localStorage.getItem('current_page_id') === page_id){
			var f = JSON.parse(localStorage.getItem("min_choice_watcher_" + page_id));
			f['current'] += 1;
		};

		if(f && f['current'] === f['limit']){
			publisher.publish("choiceLimitReached", f['page_id']);
		}
	}, true)
}