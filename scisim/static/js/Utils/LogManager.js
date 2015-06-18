/**
 * Logs messages into the LabNotebook.
 */
var LabNotebookLogManager = function() {
    this.log = "";
};

LabNotebookLogManager.prototype.writeToLog = function(message) {
    this.log += message;
};

LabNotebookLogManager.prototype.flushLog = function() {
    if(this.log.length === 0) return;

    labnotebook.add(this.log.replace("}", ""));
    this.log = "";
};


/**
 * Specific log manager for logging choices on a page
 */
var ChoiceLogManager = function() {
    this.choices = [];
    this.stopwatch = new StopWatch();
};

ChoiceLogManager.prototype.logChoice = function(choiceInfo) {
    this.choices.push(choiceInfo);
};

ChoiceLogManager.prototype.flushLog = function() {
    if(this.choices.length === 0) return;

    var time = this.stopwatch.stop();
    console.log(time);

    var user_ids = JSON.parse(localStorage.getItem("user_id"));
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
    return "Choice made: " + choiceInfo.choice + " on the choice with id: " + choiceInfo.choice_id + " on page: " + choiceInfo.page_id + " after time: " + time;
}
