var PatientPageDirectiveApplicator = function(actions, modifiers, patient){
	this.context = {};
	this.applyActions(actions, patient);
	this.applyModifiers(modifiers, patient);
};

PatientPageDirectiveApplicator.prototype.applyActions = function(actions, patient){
	var context = {};
	
	for (var i = 0; i < actions.length; i++) {
		switch(actions[i].name){
			case "add_to_notebook":
				labnotebook.add(actions[i].value.replace("}", ""));
				break;
			case "minimum_choices_reached":
				context['minimum_choice_page'] = parseInt(actions[i].value);
				break;
			case "show_all_student_content":
				PatientDOMHelper.showPatientChoices(patient);
				break;
		}
	}
	
	$.extend(this.context, context);
};

PatientPageDirectiveApplicator.prototype.applyModifiers = function(modifiers, patient){
	var context = {};
	
	for (var i = 0; i < modifiers.length; i++) {
		switch(modifiers[i].name){
			case "goes_to_page":
				context['goes_to_page'] = parseInt(modifiers[i].value);
				break;
			
			case "minimum_choices":
				context['minimum_choices'] = parseInt(modifiers[i].value.replace("}", "").replace("{", ""));
		}
	};
	
	$.extend(this.context, context);
};

PatientPageDirectiveApplicator.prototype.getContext = function(){
	return this.context;
};