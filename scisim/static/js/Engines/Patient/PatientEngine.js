// handles the interactions between the user and pages
var PatientEngine = function(){
	storageHelper.initJsonArray('visited_pages');
	this.patientManager = new PatientManager();
	this.hypothesisManager = new HypothesisManager();
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
		var hypothesis = that.hypothesisManager.discover();

		if(patient !== null){
			$.extend(pageContext, {"patient": patient});
		}

		if(hypothesis !== null){
			$.extend(pageContext, {"hypothesis": hypothesis});
		}

		pageContext['is_popup'] = false;

		$.map(response.page_modifiers, function(val, i){
			if($.inArray("popup_window", Object.values(val)) > 0){
				pageContext['is_popup'] = true;
			}
		});

		var directiveContext = new PatientPageDirectiveApplicator(pageContext, this.hypothesisManager).getContext();

		$.extend(pageContext, {"visits" : 0});
		$.extend(pageContext, directiveContext);
		$.extend(pageContext, renderer.composePage(pageContext));

		if(!pageContext.popup_window) {
			chain.add(pageContext);
			that.applyListeners();
		} else {
			that.changePage(chain.getActivePage().id);
		}
	});
};

PatientEngine.prototype.restorePage = function(page_id){
	var context = chain.findById(page_id);
	var patient = context.patient || false;

	var directiveContext = new PatientPageDirectiveApplicator(context);

	context.visits += 1;
	$.extend(context, directiveContext);
	$.extend(context, renderer.composePage(context));

	chain.updateContext(context);
	chain.updateActivePage(context);

	this.applyListeners();
};

PatientEngine.prototype.applyListeners = function () {
	var context = chain.getActivePage();
	$('#continue-btn').click(this.onContinueClick.bind(this));
	$('#submit-btn').click(this.onSubmitButtonClick.bind(this));
	$('.choice-binary .well').click(this.onBinaryChoiceClick.bind(this));
	$('#minimum-choice-continue').click(context.minimum_choice_page, this.changePage.bind(this));

	playerFactory.addListeners();
};

PatientEngine.prototype.onContinueClick = function(){
	this.changePage(chain.getActivePage().goes_to_page);
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
		choiceInfo.page_context = context;
		choiceInfo.prev = input.prev();

		this.choiceLogger.logChoice(choiceInfo);
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
			page_context: context,
			prev: $('.page-section').last()
		};

	this.choiceLogger.logChoice(choiceInfo);

	storageHelper.appendJsonArray("choices_made", choiceId);

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

	if (typeof destination === "object") {
		destination = destination.data;
	}

	storageHelper.store("last_page_id", chain.getActivePage().id);
	this.renderPage(destination);
};
