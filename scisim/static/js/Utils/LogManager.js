/**
 * Specific log manager for logging choices on a page
 */
var ChoiceLogManager = function() {
    this.choices = [];
    this.stopwatch = new StopWatch();
};

ChoiceLogManager.prototype.logChoice = function(choiceInfo) {
    this.choices.push(choiceInfo);

    var loggableString = "";

    if(choiceInfo.page_context.hasOwnProperty("patient")){
        loggableString += choiceInfo.page_context.patient.name + ": ";
    }else{
        loggableString += "Question: " + choiceInfo.prev.text() + " You said: ";
    }

    loggableString += choiceInfo.choice;

    labnotebook.add(loggableString.replace("}", ""));

    if (choiceInfo.page_context.hasOwnProperty("patient")) {
        choiceInfo.page_context.patient.choices.push(loggableString);
    }

    chain.updateContext(choiceInfo.page_context);
};

ChoiceLogManager.prototype.flushLog = function() {
    if(this.choices.length === 0) return;

    var time = this.stopwatch.stop();
    console.log(time);

    var user_ids = storageHelper.getJSON("user_id");
    if(!$.isArray(user_ids)){
        user_ids = [user_ids];
    }

    var requests = [];
    var actionString = "";
    for (var i = 0; i < user_ids.length; i++) {
        for (var j = 0; j < this.choices.length; j++) {
            actionString = getActionString(this.choices[j], time);
            requests.push([this.choices[j].page_id, user_ids[i], actionString]);
        }
    }
    api.aggregateRequests(api.logUserAction, requests);
    this.choices = [];
};

function getActionString(choiceInfo, time) {
    return "Choice made: " + choiceInfo.choice + " on the choice with id: " + choiceInfo.choice_id + " on page: " + choiceInfo.page_context.id + " after time: " + time;
}
