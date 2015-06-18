var PageRenderer = function(){};

// PageRenderer.prototype.render = function(page_id){
// 	var that = this,
// 		context = {"page_id": page_id},
// 		d = $.Deferred();
	
// 	api.getPage(page_id).done(function(response){
// 		if($.isEmptyObject(response)){
// 			throw "this page doesn't exist:";
// 		}else{
// 			context['is_popup'] = false;
// 			$.map(response.page_modifiers, function(val, i){
// 				if($.inArray("popup_window", Object.keys(val)) > 0){
// 					context['is_popup'] = true;
// 				}
// 			});
			
// 			$.extend(context, response);
// 			$.extend(context, that.composePage(context));
// 		}
		
// 		d.resolve(context);
// 	});
	
// 	return d.promise();
// };

PageRenderer.prototype.composePage = function(context) {
	var html = "";
	context['hasBinary'] = false;
	 
	for (var i = 0; i < context.sections.length; i++) {
		var section_html = tf.fillTemplate({"content": context.sections[i].content}, "page_section");
		html += section_html;
	};
	
	if (context.is_popup) {
		smoke.alert($(html).text() + " (this was added to your lab notebook)", function(e){}, {ok: "Okay, thanks!"});
		context['popup_window'] = true;
		return context;
	}
	
	for (var i = 0; i < context.choices.length; i++) {
	 	var templateType = "";

	 	switch(context.choices[i].type){
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

		var n = tf.fillTemplate({"text": context.choices[i].text, "id":context.choices[i].id, "destination": context.choices[i].destination}, templateType);
		var choices_made = storageHelper.getJson("choices_made"); 
		
		if($.inArray(context.choices[i].id, choices_made) > -1){
			n = n.replace("choice-binary", "choice-binary disabled");
		} 
		
	 	html += n;
	};
	
	if(context.goes_to_page && !context.hasTextInput && context.choices.length === 0){
		html += tf.fillTemplate({"text": "Continue", "id": "continue-btn"}, "btn");	
	} 
	
	if(context.hasTextInput) {
		html += tf.fillTemplate({"text": "Submit and continue", "id": "submit-btn"}, "btn");
	}
	
	ps.transitionPage(html);
	
	context['html'] = html;
	return context;
 };