var DOMHelper = function(){};

DOMHelper.prototype.iterateContentSections = function (func) {
	var $sections = $('.page-section');
	for (var i = 0; i < $sections.length; i++) {
		func($sections.eq(i));	
	}
};

DOMHelper.prototype.showList = function(list){
	var html = "<ul class='list'>";
	
	for (var i = 0; i < list.length; i++) {
		var element = list[i];
        element = element.split(":")
        if (element.length == 2) {
            html += "<li class='list-item'><p>"+element[1]+"</p></item>";
        } else if (element.length == 3) {
            html += "<li class='list-item'><p class='question'>"+element[1].split("You said")[0]+"</p><p class='answer'>" + element[2] + "</p></item>";
        } else if (element.length == 4) {
            html += "<li class='list-item'><p class='question'>"+element[2].split("You said")[0]+"</p><p class='answer'>" + element[3] + "</p></item>";
        } else {
            html += "<li class='list-item'>"+element+"</item>";
        }
	}
		
	html += "</ul>";
	
	this.attachUnderHeader(html);
};

DOMHelper.prototype.showListWithInputs = function (list) {
	var html = "<ul class='list'>";
	
	for (var i = 0; i < list.length; i++) {
		var element = list[i];
		html += tf.fillTemplate(
			{"text": "Question: " + element.question + "<br/>" + element.answer,
			 "id":element.choice_id,
			 "destination": null}, "list_question_choice");
	}
		
	html += "</ul>";
	
	this.attachUnderHeader(html);
};

DOMHelper.prototype.attachUnderHeader = function (html) {
	var html = "<div class='page-section'> " + html + "</div>";
	$('.page-header').after(html);
};
