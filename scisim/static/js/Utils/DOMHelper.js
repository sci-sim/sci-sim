var DOMHelper = function(){};

DOMHelper.prototype.iterateContentSections = function(func){
	$.each($('.page-section'), func);
};

DOMHelper.prototype.showList = function(list){
	var html = "<ul class='list'>";
	
	for (var i = 0; i < list.length; i++) {
		var element = list[i];
		
		html += "<li class='list-item'>"+element+"</item>";
	}
		
	html += "</ul>";
};
