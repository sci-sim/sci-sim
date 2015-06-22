/**
 * Specific log manager for logging choices on a page
 */
var ChoiceLogManager = function() {
    this.choices = [];
    this.stopwatch = new StopWatch();
};

ChoiceLogManager.prototype.logChoice = function(choiceInfo) {
    this.choices.push(choiceInfo);
	
	var loggableString = this.getLoggableString(choiceInfo.question, choiceInfo.choice, choiceInfo.page_context.patient);
    labnotebook.add(loggableString);
	
	if (!choiceInfo.page_context.hasOwnProperty("patient") && chain.getLastPage().hasOwnProperty("patient")) {
		
		// the patient can't be discovered for some choices, so we'll assume that the last page was the one that contains the patient we need.
		var c = chain.getLastPage();
		c.patient.choices.push(loggableString);
		chain.updateContext(c);
	}
};

ChoiceLogManager.prototype.logToPatient = function (question, choice, context) {
	context.patient.choices.push(this.getLoggableString(question, choice, context.patient));
	chain.updateContext(context);
};

ChoiceLogManager.prototype.flushLog = function() {
    if(this.choices.length === 0) return;

    var time = this.stopwatch.stop();
    console.log(time);

    var user_ids = storageHelper.getJson("user_id");
    if(!$.isArray(user_ids)){
        user_ids = [user_ids];
    }

    var requests = [];
    var actionString = "";
    for (var i = 0; i < user_ids.length; i++) {
        for (var j = 0; j < this.choices.length; j++) {
            actionString = this.getActionString(this.choices[j], time);
            requests.push([this.choices[j].page_id, user_ids[i], actionString]);
        }
    }
    api.aggregateRequests(api.logUserAction, requests);
    this.choices = [];
};

ChoiceLogManager.prototype.getActionString = function(choiceText, choiceId, pageId, time){
	return "Choice made: " + choiceText + " on the choice with id: " + choiceId + " on page: " + pageId + " after time: " + time;
};

ChoiceLogManager.prototype.getLoggableString = function (question, choice, patient) {
	var loggableString = "";
	
	if (patient) {
		loggableString += patient.name + ": ";	
	}
	
	loggableString += "Question: " + question + " You said: ";
	
    loggableString += choice;
	
	return loggableString.replace("}", "");
};

ChoiceLogManager.prototype.getHypothesisString = function (question, choice) {
	var hypothesisString = "";
	
	hypothesisString += ""
}