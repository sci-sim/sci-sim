var PageRenderer = function(page_id){
		this.render(page_id);		
};

PageRenderer.prototype.render = function(page_id){
	var that = this,
		context = {},
		d = $.Deferred();
	
	api.getPage(this.page_id).done(function(response){
		if($.isEmptyObject(response)){
			throw "this page doesn't exist:";
		}else{
			
			var is_popup = ($.inArray("popup_window", Object.keys()) > 0) ? true : false;
			$.extend(context, that.composePage(is_popup, response.sections, response.choices));
		}
		
		d.resolve(context);
	});
	
	return d.promise();
};

PageRenderer.prototype.composePage = function(is_popup, sections, choices) {
	var html = "";
	var context = {};
	
	context['hasBinary'] = false;
	 
	for (var i = 0; i < sections.length; i++) {
		var section_html = tf.fillTemplate({"content": sections[i].content}, "page_section");
		
		if($(section_html).children().eq(0).prop("tagName") === "AUDIO"){
			html += "<p> There's supposed to be an audio track here, but it's not currently supported. Just move along as normal...</p>";
			continue;
		}
		
		html += section_html;
	};
	
	if (is_popup) {
		smoke.alert($(html).text() + " (this was added to your lab notebook)", function(e){}, {ok: "Okay, thanks!"});
		context['popup_window'] = true;
		return context;
	}
	
	for (var i = 0; i < choices.length; i++) {
	 	var templateType = "";

	 	switch(choices[i].type){
	 		case "question":
	 			templateType = "question_choice";
				 context['hasTextInput'] = true;
	 			break;
	 		case "binary":
	 			templateType = "binary_choice";
	 			context['hasBinary'] = true;
	 			break;
	 		case "prompt":
	 			templateType = "prompt_choice";
				context['hasTextInput'] = true;
	 			break;
	 	}

		var n = tf.fillTemplate({"text": choices[i].text, "id":choices[i].id, "destination": choices[i].destination}, templateType);
		var choices_made = JSON.parse(localStorage.getItem("choices_made"));
		
		if($.inArray(choices[i].id, choices_made) > -1){
			n = n.replace("choice-binary", "choice-binary disabled");
		} 
		
	 	html += n;
	};
	
	ps.transitionPage(html);
	
	context['html'] = html;
	return context;
 };