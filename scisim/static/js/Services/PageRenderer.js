var PageRenderer = function(){};

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

	if(context.minimum_choices && context.minimum_choices <= context.visits) {
		if($('#minimum-choice-continue').length === 0){ // there's a bug that makes it appear multiple times when it shouldn't..
			var button = $(tf.fillTemplate({"id": "minimum-choice-continue", 'text': "I've collected enough data"}, "btn"));
			$('.screen').append(button);
		}
	}
	context['html'] = html;
	return context;
 };
