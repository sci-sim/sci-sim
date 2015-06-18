var HypothesisManager = function(){
	this.hypotheses = [];
};

HypothesisManager.prototype.discover = function(){
	var hypothesis = null;
	var that = this;
	
	DOMHelper.iterateContentSections(function(i, el){
		var text = $(el).text();
		
		if(text.indexOf("What health problems do the residents have?") > -1){
			hypothesis = new Hypothesis();
			var choices = $('.choice');
			$.each(choices, function(j, elem){
				hypothesis.questions.append($(elem).find('p').text());
				hypothesis.answers.append($(elem).find('input').val());
			});
			
			that.hypotheses.push(hypothesis);
		}
	});
	
	return hypothesis;
};
