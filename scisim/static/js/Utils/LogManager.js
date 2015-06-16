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


var ChoiceLogManager = function(page_id) {
    this.page_id = page_id;
    this.messages = [];
};

ChoiceLogManager.prototype.writeToLog = function(message) {
    this.messages.push(message);
};

ChoiceLogManager.prototype.flushLog = function(message) {
    if(this.messages.length === 0) return;

    var user_ids = JSON.parse(localStorage.getItem("user_id"));
    if(!$.isArray(user_ids)){
        user_ids = [user_ids];
    }

    var requests = [];
    for (var i = 0; i < user_ids.length; i++) {
        for (var j = 0; j < this.messages.length; j++) {
            requests.push([this.page_id, user_ids[i], this.messages[j]]);
        }
    }
    api.aggregateRequests(api.logUserAction, requests);
    this.messages = [];
};
