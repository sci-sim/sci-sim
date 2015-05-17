var PageController = function(page_id){
	this.page_id = parseInt(page_id);
	this.render();
	this.visits = 0;
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
	 
	 	if($(section_html).children().eq(0).prop("tagName") === "AUDIO"){
	 		html += "<p> There's supposed to be an audio track here, but it's not currently supported. Just move along as normal...</p>";
	 		continue;
		}

	 	html += section_html;
	 };
	 
	if(this.isPopup){
		smoke.alert($(html).text() + " (this was added to your lab notebook)", function(e){}, {ok: "Okay, thanks!"});
		// TODO: the page we want is not always the last page. 
		var lastpage = chain.getLastPage();
		lastpage.visits +=1;
		lastpage.checkVisits();
		return;	
	}
	
	this.hasBinary = false;

	 for (var i = 0; i < choices.length; i++) {
	 	var templateType = "";

	 	switch(choices[i].type){
	 		case "question":
	 			templateType = "question_choice";
				 this.hasTextInput = true;
	 			break;
	 		case "binary":
	 			templateType = "binary_choice";
	 			this.hasBinary = true;
	 			break;
	 		case "prompt":
	 			templateType = "prompt_choice";
				 this.hasTextInput = true;
	 			break;
	 	}

	 	//TODO: questions are special because they don't 
	 	html += tf.fillTemplate({"text": choices[i].text, "id":choices[i].id, "destination": choices[i].destination}, templateType);
	 };

	 if(this.hasTextInput) html += tf.fillTemplate({"text": "Submit and continue", "id": "submit-btn"}, "btn");
	 if(this.goes_to_page && !this.hasTextInput) html += tf.fillTemplate({"text": "Continue", "id": "continue-btn"}, "btn");
	 
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
			case "minimum_choices_reached":
				this.minimum_choice_page = parseInt(actions[i].value);
				break;
			case "show_all_student_content":
				labnotebook.toggle();
				break;
		}
	}

	for (var i = 0; i < modifiers.length; i++) {
		switch(modifiers[i].name){
			case "goes_to_page":
				this.goes_to_page = parseInt(modifiers[i].value);
				break;
			
			case "popup_window":
				this.isPopup = true;
				break;
			
			case "minimum_choices":
				this.minimum_choices = parseInt(modifiers[i].value.replace("}", "").replace("{", ""));
		}
	};
};

PageController.prototype.init = function() {
	if(this.checkVisits()) return;

	$('#go-back').click(function(e){
		e.stopImmediatePropagation();
		chain.goBack();
	});
	
	$('#continue-btn').click(this.processContinueClick.bind(this));

	$('#submit-btn').click(this.processButtonClick.bind(this));
	$('.choice-binary .well').click(this.processBinaryClick.bind(this));
};

PageController.prototype.checkVisits = function(){
	if(this.minimum_choices === this.visits || this.minimum_choices < this.visits){
		smoke.alert("Alright, that's enough experimenting! Time to move on.", function(e){
			publisher.publish('changePage', [PageController, this.minimum_choice_page]);
		}.bind(this), {ok:"Okay, let's go!"});
		
		return true;
	}
	
	return false;
};

PageController.prototype.processContinueClick = function(e){
		publisher.publish('changePage', [PageController, this.goes_to_page]);
};

PageController.prototype.processBinaryClick = function(e) {
	e.stopImmediatePropagation();
	var $elem = $(e.currentTarget);

	var value = $elem.text(),
		choiceId = $elem.data('choice-id'),
		destinationId = $elem.data('destination'),
		action_string = getActionString(value, choiceId, this.page_id),
		user_ids = JSON.parse(localStorage.getItem("user_id"));
		labnotebook.add(action_string);

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
	e.stopImmediatePropagation();
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
	this.checkVisits();
};

function getActionString(action, choice_id, page_id){
	return "Choice made: "+ action + " on the choice with id: " + choice_id + " on page: " + page_id;
}