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
	
	this.attachUnderHeader(html);
};

DOMHelper.prototype.attachUnderHeader = function (html) {
	var $sections = $('.page-section');
	var $target = null;
	
	for (var i = 0; i < $sections.length; i++) {
		var $element = $sections.eq(i);
		if ($element.next().hasClass('page-section')) {
			$target = $element;
			break;
		}
	}
	
	if ($target) {
		$target.append(html);
	} else {
		$sections.eq(0).append(html);
	}
};
