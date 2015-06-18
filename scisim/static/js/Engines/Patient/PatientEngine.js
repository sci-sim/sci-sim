// handles the interactions between the user and pages
var PatientEngine = function(){
	this.renderPage(localStorage.getItem("first_page_id"));
	this.context = {};
	this.patientManager = new PatientManager();
};

PatientEngine.prototype.renderPage = function(page_id){
	var that = this;
	
	api.getPage(page_id).done(function(response){
		if($.isEmptyObject(response)){
			throw "this page doesn't exist:";
		}
		
		var pageContext = response;
		var patientID = that.patientManager.discover();
		
		pageContext['is_popup'] = false;
		
		$.map(response.page_modifiers, function(val, i){
			if($.inArray("popup_window", Object.values(val)) > 0){
				pageContext['is_popup'] = true;
			}
		});
		
		var directiveContext = new PatientPageDirectiveApplicator(pageContext.page_actions, pageContext.page_modifiers, that.patientManager.getPatient(patientID)).getContext(); 
		
		$.extend(pageContext, directiveContext);
		$.extend(pageContext, renderer.composePage(pageContext));
		
		chain.add(pageContext);
		
		if(patientID !== null){
			$.extend(that.context, {"current_patient_id": patientID});	
		}
		
		that.applyListeners();
	});
};

PatientEngine.prototype.applyListeners = function () {
	$('#continue-btn').click(this.onContinueClick.bind(this));
	$('#submit-btn').click(this.onSubmitButtonClick.bind(this));
	$('.choice-binary .well').click(this.onBinaryChoiceClick.bind(this));
};

PatientEngine.prototype.onContinueClick = function(){
	var currentPage = chain.getActivePage();
	this.renderPage(currentPage.goes_to_page);
};

PatientEngine.prototype.onSubmitButtonClick = function(e){
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

		obj['value'] = input.val();;
		obj['id'] = input.data("choice-id");
		
		destination = chain.getActivePage().goes_to_page;
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
	var user_ids = LocalStorageManager.getPageId();	//JSON.parse(localStorage.getItem("user_id"));

	if(!$.isArray(user_ids)){
		//this means there's just 1 user going through the simulation
		user_ids = [user_ids];
	}

	var requests = [];
	for (var i = 0; i < user_ids.length; i++) {
		for (var j = 0; j < choicesMade.length; j++) {
			requests.push([chain.getActivePage().page_id, user_ids[i], choicesMade[j].action_string]);
		};
	};

	this.logActions(requests, destination);	
};


PatientEngine.prototype.onBinaryChoiceClick = function(e){
	e.stopImmediatePropagation();
	var $elem = $(e.currentTarget);
	var page = chain.getActivePage();
	
	if($elem.parent().hasClass("disabled")) return;
	
	var value = $elem.text(),
		choiceId = $elem.data('choice-id'),
		destinationId = $elem.data('destination'),
		action_string = getActionString(value, choiceId, page.id),
		user_ids = LocalStorageManager.getPageId();	//JSON.parse(localStorage.getItem("user_id"));
		
		var loggableString = "";
		
		if(chain.getLastPage().patient){
			loggableString += chain.getLastPage().patient+ ": ";	
		}else{
			loggableString += "Question: " + $('.page-section').last().text() + " You said: ";
		}
		
		loggableString += value;
		labnotebook.add(loggableString.replace("}", ""));
		
		var choices_made = LocalStorageManager.getUserChoices();	//JSON.parse(localStorage.getItem("choices_made"));
		choices_made.push(choiceId);
		LocalStorageManger.setUserChoices(choices_made);	//localStorage.setItem("choices_made", JSON.stringify(choices_made));

	if(!$.isArray(user_ids)){
		user_ids = [user_ids];
	}

	var requests = [];
	for (var i = 0; i < user_ids.length; i++) {
		requests.push([page.id, user_ids[i], action_string]);
	};

	if(requests.length > 1){
		this.logActions(requests, destinationId);
	}else{
		var that = this;
		api.logUserAction.apply(null, requests[0]).then(function (response) {
			  if(!response.hasOwnProperty("error")){
			  		LocalStorageManager.setLastPageId(that.page_id);	//localStorage.setItem('last_page_id', that.page_id);
					that.renderPage(destinationId);
			  }
		});
	}
	
	$elem.parent().addClass("disabled");
};

PatientEngine.prototype.restoreLast = function(){
	var context = chain.getLastPage();
	this.changePage(context.page_id);	
};

PatientEngine.prototype.disableChoices = function() {
	var choices = $('.choice');
	for (var i = 0; i < choices.length; i++) {
		choices.eq(i).addClass("disabled");
	};
};

function getActionString(action, choice_id, page_id){
	return "Choice made: "+ action + " on the choice with id: " + choice_id + " on page: " + page_id;
}

PatientEngine.prototype.logActions = function(data, destination) {
	var that = this;

	api.aggregateRequests(api.logUserAction, data).then(function(){

		loader.hide();
		if(destination){
			LocalStorageManager.setLastPageId(that.page_id);	//localStorage.setItem('last_page_id', that.page_id);
			
			that.renderPage(destination); // assume that that's all we need to do on the page	
		}
	});
};