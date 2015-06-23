var PatientPageDirectiveApplicator = function(context, hypothesisManager){
	this.context = {};
	this.pageContext = context;
	this.hypothesisManager = hypothesisManager;
};

PatientPageDirectiveApplicator.prototype.applyActions = function () {
	var actions = this.pageContext.page_actions;
	var context = {};
	
	for (var i = 0; i < actions.length; i++) {
		switch(actions[i].name){
			case "add_to_notebook":
				labnotebook.add(actions[i].value.replace("}", ""));
				break;
				
			case "show_patient_choices":
                if (chain.activePointer == chain.currentPointer) {
                    var f = chain.getActivePage();
                    chain.patient_choices_for_ret = f;
                } else {
                    var f = chain.patient_choices_for_ret;
                }
				DOMHelper.showList(f.patient.choices);
				break;
				
			case "show_hypotheses":
				DOMHelper.showList([this.hypothesisManager.getCurrentHypothesis()]);
				break;
		}
	}
	
	$.extend(this.context, context);
	return context;
};

PatientPageDirectiveApplicator.prototype.applyModifiers = function (modifiers) {
	var modifiers = this.pageContext.page_modifiers; 
	var context = {};
	
	for (var i = 0; i < modifiers.length; i++) {
		switch(modifiers[i].name){
			case "goes_to_page":
				context['goes_to_page'] = parseInt(modifiers[i].value);
				break;
			
			case "minimum_choices":
				context['minimum_choices'] = parseInt(modifiers[i].value.replace("}", "").replace("{", ""));
				break;
				
			case "minimum_choices_reached":
				context['minimum_choice_page'] = parseInt(modifiers[i].value);
				break;
		}
	};
	
	$.extend(this.context, context);
	return context;
};

PatientPageDirectiveApplicator.prototype.getContext = function(){
	return this.context;
};
