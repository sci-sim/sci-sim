var PageRenderer = function(){};

PageRenderer.prototype.composePage = function(context) {
	var html = "";
	context['hasBinary'] = false;
    context['containsImage'] = false;
    html += "<div id='content-before-buttons'>";
	for (var i = 0; i < context.sections.length; i++) {
        var section_html = "";
        if(i == 0 && context.sections[i].content.indexOf("<h1>") != -1){
            section_html = tf.fillTemplate({"content": context.sections[i].content}, "page_header");
        } else if(context.sections[i].content.indexOf("<img") != -1) {
            section_html = tf.fillTemplate({"content": context.sections[i].content}, "section_with_img");
            context['containsImage'] = true;
            if(context.title.indexOf("heart") != -1 || context.title.indexOf("feet") != -1 || context.title.indexOf("eyes") != -1){
                section_html += "<div class='content-spacer'></div>";
            }
        } else if(context.sections[i].content.indexOf("audio:") != -1) {
        	var audioFile = context.sections[i].content.slice(6);
        	var audioPlayer = playerFactory.createAudioPlayer(audioFile);
        	console.log(audioPlayer.getPlayerAsHTML());
        	section_html += tf.fillTemplate({"content": audioPlayer.getPlayerAsHTML()}, "page_section");
        } else {
            section_html = tf.fillTemplate({"content": context.sections[i].content}, "page_section");
        }
		html += section_html;
	}

	if (context.is_popup) {
		smoke.alert($(html).text() + " (this was added to your lab notebook)", function(e){}, {ok: "Okay, thanks!"});
		context['popup_window'] = true;
		context['popup_text'] = $(html).text();
		return context;
	}
    if (!context['containsImage']) {
        html += "<div class='break-here'></div>";
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
        if(context.choices[i].text =="yes" || context.choices[i].text =="no") {
            var n = tf.fillTemplate({"text": context.choices[i].text, "id":context.choices[i].id, "destination": context.choices[i].destination}, "binary_yesno_choice");
        } else if (context.choices[i].text.indexOf("Age:") != -1) {
            var n = tf.fillTemplate({"text": context.choices[i].text, "id":context.choices[i].id, "destination": context.choices[i].destination, "name":context.choices[i].text.split(". ")[1].split("<")[0].toLowerCase()}, "binary_choice_person");
        } else {
            var n = tf.fillTemplate({"text": context.choices[i].text.replace("}", ""), "id":context.choices[i].id, "destination": context.choices[i].destination}, templateType);
        }
		var choices_made = storageHelper.getJson("choices_made");

		if($.inArray(context.choices[i].id, choices_made) > -1){
			n = n.replace("choice-binary", "choice-binary disabled");
		}

	 	html += n;
	};
    html += "<div class='break-here'></div>";
    html +="</div>";
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
