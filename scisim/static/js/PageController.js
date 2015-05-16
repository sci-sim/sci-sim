var PageController = function(page_id){
	this.page_id = parseInt(page_id);
	this.render();
};

PageController.prototype.render = function() {
	var that = this;

	api.getPage(this.page_id).done(function(response){
		if($.isEmptyObject(response)){
			alert("this page doesn't exist");
		}else{
			that.applyDirectives(response);
			that.composePage(response);
			that.init();
		}
	});
};

PageController.prototype.composePage = function(pageResponse) {
	var sections = pageResponse.sections,
		choices = pageResponse.choices,
	 	html = "";

	 for (var i = 0; i < sections.length; i++) {
	 	var section_html = tf.fillTemplate({"content": sections[i].content}, "page_section");
	 	if($(section_html).children().eq(0).prop("tagName") === "IMG"){
	 		html += "<p> There's supposed to be an image here, but images aren't currently supported. Just move along as normal...</p>";
	 		continue;
	 	}

	 	if($(section_html).children().eq(0).prop("tagName") === "AUDIO"){
	 		html += "<p> There's supposed to be an audio track here, but it's not currently supported. Just move along as normal...</p>";
	 		continue;
		}

	 	html += section_html;
	 };
	 
	if(this.isPopup){
		smoke.alert($(html).text() + " (this was added to your lab notebook)", function(e){}, {ok: "Okay, thanks!"});
		return;	
	}
	
	this.hasBinary = false;

	 for (var i = 0; i < choices.length; i++) {
	 	var templateType = "";

	 	switch(choices[i].type){
	 		case "question":
	 			templateType = "question_choice";
	 			break;
	 		case "binary":
	 			templateType = "binary_choice";
	 			this.hasBinary = true;
	 			break;
	 		case "prompt":
	 			templateType = "prompt_choice";
	 			break;
	 	}

	 	//TODO: questions are special because they don't 
	 	html += tf.fillTemplate({"text": choices[i].text, "id":choices[i].id, "destination": choices[i].destination}, templateType);
	 };

	 if(!this.hasBinary) html += tf.fillTemplate(null, "submit_btn");
	 
	 html = tf.wrapInParent(html);
	 ps.transitionPage(html);
	 this.$html = $(html);
	 chain.add(this);
};


PageController.prototype.applyDirectives = function(pageResponse) {
	var actions = pageResponse.page_actions,
		modifiers = pageResponse.page_modifiers;
	
	for (var i = 0; i < actions.length; i++) {
		switch(actions[i].name){
			case "add_to_notebook":
				labnotebook.add(actions[i].value);
				break;
		}	
	}

	for (var i = 0; i < modifiers.length; i++) {
		switch(modifiers[i].name){
			case "goes_to_page":
				this.needsPageButton = true;
				this.goes_to_page = parseInt(modifiers[i].value);
				break;
			
			case "popup_window":
				this.isPopup = true;
				break;
		}
	};
};

PageController.prototype.init = function() {
	var that = this;

	$('#go-back').click(function(e){
		e.stopImmediatePropagation();
		chain.goBack();
	});

	// if they click the button, then they were responding to inputs. otherwise, they were responding to a binary choice.
	
	$('#submit').click(this.processButtonClick.bind(this));
	$('.choice-binary .well').click(this.processBinaryClick.bind(this));

	publisher.subscribe("choiceLimitReached", function(pageId){
		that.disableChoices();
	}, true);
};

PageController.prototype.processBinaryClick = function(e) {
	var $elem = $(e.currentTarget);

	var value = $elem.text(),
		choiceId = $elem.data('choice-id'),
		destinationId = $elem.data('destination'),
		action_string = getActionString(value, choiceId, this.page_id),
		user_ids = JSON.parse(localStorage.getItem("user_id"));

	if(!$.isArray(user_ids)){
		user_ids = [user_ids];
	}

	var requests = [];
	for (var i = 0; i < user_ids.length; i++) {
		requests.push([this.page_id, user_ids[i], action_string]);
	};

	if(requests.length > 1){
		this.logActions(requests, destinationId);
	}else{
		var that = this;
		api.logUserAction.apply(null, requests[0]).then(function (response) {
			  if(!response.hasOwnProperty("error")){
			  		localStorage.setItem('last_page_id', that.page_id);
					publisher.publish('changePage', [PageController, destinationId]);
			  }
		});
	}
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
		
		destination = this.goes_to_page; // assume that this is a modified page

		obj['action_string'] = getActionString(obj['value'], obj['id'], this.page_id);

		choicesMade.push(obj);
	};

	// we're going to construct this so that later we can make a parser that generates insightful xls documents based on these. 
	var user_ids = JSON.parse(localStorage.getItem("user_id"));

	if(!$.isArray(user_ids)){
		//this means there's just 1 user going through the simulation
		user_ids = [user_ids];
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
	var that = this;

	api.aggregateRequests(api.logUserAction, data).then(function(){
		var responses = arguments;
		
		for (var i = 0; i < responses.length; i++) {
			if(responses[i].hasOwnProperty('error')){
				console.log("things didn't go well.. " + responses[i].error);
				return; //TODO: provide an error here
			}
		};

		loader.hide();
		if(destination){
			localStorage.setItem('last_page_id', that.page_id);
			
			publisher.publish('changePage', [PageController, destination]); // assume that that's all we need to do on the page	
		}
	});
};

PageController.prototype.disableChoices = function() {
	var choices = $('.choice');
	for (var i = 0; i < choices.length; i++) {
		choices.eq(i).addClass("disabled");
	};
};

PageController.prototype.sleep = function(){
	$('.screen').fadeOut().remove();
};

PageController.prototype.revive = function(){
	this.$html.appendTo(".page-container").hide().fadeIn();
	this.init();
	this.visits += 1;
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
	}, true);
};

function getActionString(action, choice_id, page_id){
	return "Choice made: "+ action + " on the choice with id: " + choice_id + " on page: " + page_id;
}