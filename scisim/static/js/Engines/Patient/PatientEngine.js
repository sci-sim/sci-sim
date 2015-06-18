// handles the interactions between the user and pages
var PatientEngine = function(){
	storageHelper.initJsonArray('visited_pages');
	this.patientManager = new PatientManager();

	this.renderPage(storageHelper.get("first_page_id"));
	this.choiceLogger = new ChoiceLogManager();
};

PatientEngine.prototype.renderPage = function(page_id){
	var that = this;

	if($.inArray(page_id, storageHelper.getJson('visited_pages')) > -1){
		this.restorePage(page_id);
		return;
	}

	storageHelper.appendJsonArray('visited_pages', page_id);

	api.getPage(page_id).done(function(response){
		if($.isEmptyObject(response)){
			throw "this page doesn't exist:";
		}

		var pageContext = response;
		var patient = that.patientManager.discover();

		pageContext['is_popup'] = false;

		$.map(response.page_modifiers, function(val, i){
			if($.inArray("popup_window", Object.values(val)) > 0){
				pageContext['is_popup'] = true;
			}
		});

		var directiveContext = new PatientPageDirectiveApplicator(pageContext.page_actions, pageContext.page_modifiers, patient).getContext();

		$.extend(pageContext, directiveContext);
		$.extend(pageContext, renderer.composePage(pageContext));

		if(patient !== null){
			$.extend(pageContext, {"patient": patient});
		}

		chain.add(pageContext);

		that.applyListeners();
	});
};

PatientEngine.prototype.restorePage = function(page_id){
	var context = chain.findById(page_id);
	var patient = context.patient || false;

	new PatientPageDirectiveApplicator(context.page_actions, context.page_modifiers, patient);

	$.extend(context, renderer.composePage(context));

	this.applyListeners();
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
		context = chain.getActivePage(),
		destination = "";

	for (var i = 0; i < $inputs.length; i++) {
		var input = $inputs.eq(i);
		var choiceInfo = {};

		if(input.val().length === 0){
			// TODO: extract this to a form helper class
			input.addClass("has-danger");
			input.attr('placeholder', "This field must be filled.");
			return;
		}

		destination = context.goes_to_page || false;
		if(!destination) destination = input.data("destination");

		choiceInfo.choice = input.val();
		choiceInfo.choice_id = input.data("choice-id");
		choiceInfo.page_id = page_id;

		this.choiceLogger.logChoice(choiceInfo);

		//	TODO: this is just a quick fix. what if the request fails?
		var loggableString = "";

		if(context.hasOwnProperty("patient")){
			loggableString += context.patient.name + ": ";
		}else{
			loggableString += "Question: " + input.prev().text() + "You said: ";
		}

		loggableString += input.val();
		labnotebook.add(loggableString.replace("}", ""));

		if(context.hasOwnProperty('patient')) context.patient.choices.push(loggableString);
	};

	chain.updateContext(context);
	// we're going to construct this so that later we can make a parser that generates insightful xls documents based on these.
	var user_ids = storageHelper.getJson("user_id");

	if(!$.isArray(user_ids)){
		//this means there's just 1 user going through the simulation
		user_ids = [user_ids];
	}

	var requests = [];
	for (var i = 0; i < user_ids.length; i++) {
		for (var j = 0; j < choicesMade.length; j++) {
			requests.push([context.id, user_ids[i], choicesMade[j].action_string]);
		}
	}

	this.logActions(requests, destination);
	}

	this.changePage(destination);
};


PatientEngine.prototype.onBinaryChoiceClick = function(e){
	e.stopImmediatePropagation();
	var $elem = $(e.currentTarget);
	var context = chain.getActivePage();
	if($elem.parent().hasClass("disabled")) return;

	var value = $elem.text(),
		choiceId = $elem.data('choice-id'),
		destinationId = $elem.data('destination'),
		choiceInfo = {
			choice: value,
			choice_id: choiceId,
			page_id: context.id
		};

	storageHelper.appendJsonArray("choices_made", choiceId);

	var loggableString = "";

	if(context.hasOwnProperty("patient"){
		loggableString += chain.getLastPage().patient+ ": ";
	}else{
		var that = this;
		api.logUserAction.apply(null, requests[0]).then(function (response) {
			  if(!response.hasOwnProperty("error")){
			  		storageHelper.store('last_page_id', context.id);
					that.renderPage(destinationId);
			  }
		});
		loggableString += "Question: " + $('.page-section').last().text() + " You said: ";
	}

	loggableString += value;
	labnotebook.add(loggableString.replace("}", ""));

	this.choiceLogger.logChoice(choiceInfo);

	var choices_made = JSON.parse(localStorage.getItem("choices_made"));
	choices_made.push(choiceId);
	localStorage.setItem("choices_made", JSON.stringify(choices_made));

	$elem.parent().addClass("disabled");

	this.changePage(destinationId);
};

PatientEngine.prototype.restoreLast = function(){
	var context = chain.getLastPage();
	this.changePage(context.id);
};

PatientEngine.prototype.disableChoices = function() {
	var choices = $('.choice');
	for (var i = 0; i < choices.length; i++) {
		choices.eq(i).addClass("disabled");
	}
};

PatientEngine.prototype.changePage = function(destination) {
	this.choiceLogger.flushLog();
	if (destination) {
		localStorage.setItem('last_page_id', chain.getActivePage().id);
		this.renderPage(destination);
	}
};
