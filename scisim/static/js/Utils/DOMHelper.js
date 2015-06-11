var DOMHelper = function(){};

DOMHelper.prototype.iterateContentSections = function(func){
	$.each($('.page-section'), func);
};