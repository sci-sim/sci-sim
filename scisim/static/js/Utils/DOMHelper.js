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
		
		html += "<li class='list-item'>"+element+"</item>";
	}
		
	html += "</ul>";
	
	this.attachUnderHeader(html);
};

DOMHelper.prototype.attachUnderHeader = function (html) {
	var html = "<div class='page-section'> " + html + "</div>";
	$('.page-header').after(html);
};
