var PageController = function(page_id){
	if(localStorage.getItem(page_id)){
			localStorage.setItem(page_id, parseInt(localStorage.getItem(page_id)) + 1);
	}else{
		localStorage.setItem(page_id, 1);
	}
<<<<<<< Updated upstream
	
=======

	// quick proof of concept until LocalStorage abstraction is implemented
	if(!localStorage.getItem(page_id + "_time_spent")){
		localStorage.setItem(page_id + "_time_spent", 0);
	}

>>>>>>> Stashed changes
	this.page_id = parseInt(page_id);
	this.render();
	this.visits = parseInt(localStorage.getItem(page_id));
	this.stopwatch = new StopWatch();
	this.stopwatch.start();
};

PageController.prototype.render = function() {
	var that = this;

	api.getPage(this.page_id).done(function(response){
		if($.isEmptyObject(response)){
			throw "this page doesn't exist:";
		}else{
			that.applyDirectives(response);
			that.composePage(response);
			that.checkVisits();
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
		 
	 	if(sections[i].content.search("Mr") > 0 || sections[i].content.search("Ms") > 0){
			 var split = sections[i].content.split(" ");
			 this.patient = split.splice(split.length - 2).join(" ").replace(/(<([^>]+)>)/ig,"");
		 }
		 
	 	if($(section_html).children().eq(0).prop("tagName") === "AUDIO"){
	 		html += "<p> There's supposed to be an audio track here, but it's not currently supported. Just move along as normal...</p>";
	 		continue;
		}

	 	html += section_html;
	 };
	 
	if(this.isPopup){
		smoke.alert($(html).text() + " (this was added to your lab notebook)", function(e){}, {ok: "Okay, thanks!"});
		var last_page = chain.getLastPage(),
			page_id = last_page.page_id;
			
		localStorage.setItem(page_id, parseInt(localStorage.getItem(page_id)) + 1);
		last_page.visits += 1;
		last_page.checkVisits();
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
		var n = tf.fillTemplate({"text": choices[i].text, "id":choices[i].id, "destination": choices[i].destination}, templateType);
		var choices_made = JSON.parse(localStorage.getItem("choices_made"));
		if($.inArray(choices[i].id, choices_made) > -1){
			n = n.replace("choice-binary", "choice-binary disabled");
		} 
		
	 	html += n;
	 };

	 if(this.hasTextInput) html += tf.fillTemplate({"text": "Submit and continue", "id": "submit-btn"}, "btn");
	 if(this.goes_to_page && !this.hasTextInput && choices.length === 0) html += tf.fillTemplate({"text": "Continue", "id": "continue-btn"}, "btn");
	 
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
				labnotebook.add(actions[i].value.replace("}", ""));
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
		if($('#minimum-choice-continue').length === 0){ // there's a bug that makes it appear multiple times when it shouldn't..
			var button = $(tf.fillTemplate({"id": "minimum-choice-continue", 'text': "I've collected enough data"}, "btn"));
			$('.screen').append(button);
			var that = this;
				console.log(that.minimum_choice_page);
			button.click(function(){
				that.logTimeSpentOnPage();
				publisher.publish('changePage', [PageController, that.minimum_choice_page]);
			});		
		}
		return true;
	}
	return false;
};

PageController.prototype.processContinueClick = function(e){
		this.logTimeSpentOnPage();
		publisher.publish('changePage', [PageController, this.goes_to_page]);
};

PageController.prototype.processBinaryClick = function(e) {
	e.stopImmediatePropagation();
	var $elem = $(e.currentTarget);
	if($elem.parent().hasClass("disabled")) return;
	
	var value = $elem.text(),
		choiceId = $elem.data('choice-id'),
		destinationId = $elem.data('destination'),
		action_string = getActionString(value, choiceId, this.page_id),
		user_ids = JSON.parse(localStorage.getItem("user_id"));
		
		var loggableString = "";
		
		if(chain.getLastPage().patient){
			loggableString += chain.getLastPage().patient+ ": ";	
		}else{
			loggableString += "Question: " + $('.page-section').last().text() + " You said: ";
		}
		
		loggableString += value;
		labnotebook.add(loggableString.replace("}", ""));
		
		var choices_made = JSON.parse(localStorage.getItem("choices_made"));
		choices_made.push(choiceId);
		localStorage.setItem("choices_made", JSON.stringify(choices_made));

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
			  		that.logTimeSpentOnPage();
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
		
		if(input.val().length === 0){
			// TODO: extract this to a form helper class
			input.addClass("has-danger");
			input.attr('placeholder', "This field must be filled.");
			return;
		}

		obj['value'] = input.val();
		obj['id'] = input.data("choice-id");
		
		destination = this.goes_to_page;
		if(!destination) destination = input.data("destination");

		obj['action_string'] = getActionString(obj['value'], obj['id'], this.page_id);

		choicesMade.push(obj);
		
		//	TODO: this is just a quick fix. what if the request fails?
		var loggableString = "";
		
		
		if(chain.getLastPage().patient && chain.getLastPage().patient !== "undefined"){
			loggableString += chain.getLastPage().patient+ ": ";	
		}else{
			loggableString += "Question: " + input.prev().text() + "You said: ";
		}
		
		loggableString += input.val();
		labnotebook.add(loggableString.replace("}", ""));
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

		loader.hide();
		if(destination){
			localStorage.setItem('last_page_id', that.page_id);
<<<<<<< Updated upstream
			
			publisher.publish('changePage', [PageController, destination]); // assume that that's all we need to do on the page	
=======

			that.logTimeSpentOnPage();
			publisher.publish('changePage', [PageController, destination]); // assume that that's all we need to do on the page
>>>>>>> Stashed changes
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

/**
 * Simple function which will log time spent on page in local storage
 */
PageController.prototype.logTimeSpentOnPage = function() {
	var timeSpentOnPage = this.stopwatch.stop();
	var timeSpentOnPageBefore = parseInt(localStorage.getItem(this.page_id + "_time_spent"));
	localStorage.setItem(this.page_id + "_time_spent", timeSpentOnPage + timeSpentOnPageBefore);
};

function getActionString(action, choice_id, page_id){
	return "Choice made: "+ action + " on the choice with id: " + choice_id + " on page: " + page_id;
}
