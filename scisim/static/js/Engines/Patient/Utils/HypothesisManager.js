var HypothesisManager = function(){
	this.hypotheses = [];
};

HypothesisManager.prototype.discover = function(){
	var id = null;
	var that = this;
	
	DOMHelper.iterateContentSections(function(i, el){
		var text = $(el).text();
		
		if(text.indexOf("What health problems do the residents have?") > -1){
			var hypothesis = new Hypothesis();
			var choices = $('.choice');
			$.each(choices, function(j, elem){
				hypothesis.questions.append($(elem).find('p').text());
				hypothesis.answers.append($(elem).find('input').val());
			});
			
			that.hypotheses.push(hypothesis);
			id = hypothesis.id;
		}
	});
	
	return id;
};