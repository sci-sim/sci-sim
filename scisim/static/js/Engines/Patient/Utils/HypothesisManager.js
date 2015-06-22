var HypothesisManager = function(){
	this.hypotheses = [];
	this.counter = 0;
};

HypothesisManager.prototype.discover = function(){
	var collection = null,
		that = this,
		text = $.trim($('.page-header').text());
	
	if(text.indexOf("What health problems do the residents have?") > -1 || text.indexOf("Why do the residents have these health problems?") > -1){
		collection = new HypothesisCollection();
		var choices = $('.choice');
		$.each(choices, function (j, elem) {
			var collectionData = {
				'answer': "You said: " + $(elem).find('input').val(),
				'question': $(elem).find('p').text(),
				'choice_id': $(elem).find('input').data("choice-id")
			};
			collection.hypotheses.push(collectionData);
		});
		
		that.hypotheses.push(collection);
	}
	
	return collection;
};

HypothesisManager.prototype.getCurrentHypothesis = function () {
	var r = this.hypotheses[this.counter];
	this.counter++; // we're only going to have 2 hyptheses. If we already got the first one, then the next time we call this then we'll want the next one. 
	 
	return r;
};