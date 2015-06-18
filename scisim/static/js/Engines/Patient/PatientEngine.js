// handles the interactions between the user and pages
var PatientEngine = function(){
	this.renderPage(localStorage.getItem("first_page_id"));
	this.patientManager = new PatientManager();
	this.choiceLogger = new ChoiceLogManager();
};

PatientEngine.prototype.renderPage = function(page_id){
	var that = this;

	api.getPage(page_id).done(function(response){
		if($.isEmptyObject(response)){
			throw "this page doesn't exist:";
		}

		var pageContext = response;
		var patientID = that.patientManager.discover();

		var directiveContext = new PatientPageDirectiveApplicator(pageContext.page_actions, pageContext.page_modifiers, that.patientManager.getPatient(patientID)).getContext();

		$.extend(pageContext, directiveContext);
		$.extend(pageContext, renderer.composePage(pageContext));

		chain.add(pageContext);

		if(patientID !== null){
			$.extend(pageContext, {"current_patient_id": patientID});
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
		page_id = chain.getActivePage().id,
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

		destination = chain.getActivePage().goes_to_page;
		if(!destination) destination = input.data("destination");

		choiceInfo.choice = input.val();
		choiceInfo.choice_id = input.data("choice-id");
		choiceInfo.page_id = page_id;
		choiceInfo.prev = input.prev();

		console.log(choiceInfo.choice);

		this.choiceLogger.logChoice(choiceInfo);
	}

	this.changePage(destination);
};


PatientEngine.prototype.onBinaryChoiceClick = function(e){
	e.stopImmediatePropagation();
	var $elem = $(e.currentTarget);
	var page = chain.getActivePage();

	if($elem.parent().hasClass("disabled")) return;

	var value = $elem.text(),
		choiceId = $elem.data('choice-id'),
		destinationId = $elem.data('destination'),
		choiceInfo = {
			choice: value,
			choice_id: choiceId,
			page_id: page.id,
			prev: $('.page-section').last()
		};

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
