var TemplateFiller = function(){};
// TODO: rename this to TemplateManager

/**
 * TODO: lets make these for all the library class functions
 * Fills the template with data
 * @param  {object} data     the data to be injected.
 * @param  {string} pageName the name of the template
 * @return {string}          plain html of the template
 */
TemplateFiller.prototype.fillTemplate = function(data, pageName) {
	var template = this.getTemplate(pageName);

	if(data === null) return template;

	for(var key in data){
		var fkey = "{" + key + "}";
		template = template.replace(fkey, data[key]);
	}

	return  template;
};

TemplateFiller.prototype.compose = function(dataList, pageList) {
	var html = "";
	
	for (var i = 0; i < pageList.length; i++) {
		html += this.fillTemplate(dataList[i], pageList[i]);
	};

	return html;
};

TemplateFiller.prototype.wrapInParent = function(html) {
	return "<div class='screen'>" + html + "</div>";
};

TemplateFiller.prototype.getTemplate = function(pageName) {
	switch(pageName){
		case "choose_simulation":
			return '<div class="list-group-item simluation-item clickable"><span class="badge"></span> <div class="media"> <div class="media-left"> <a href="#"> <img class="media-object" src="img/sim_demo/page_1_s.jpg"> </a> </div> <div class="media-body"> <h4 class="media-heading list-item-heading">{title}</h4> <p>{desc}</p> <input type="hidden" value="{first_page_id}" name="first_page_id"> <input type="hidden" value="{id}" name="sim_id"> </div> </div> </div>';

		case "group_chooser":
			// TODO: get the template from the /js/templates directory...load them in with ajax later
			return '<div class="panel panel-default choose_group_panel"> <div class="panel-heading"> <h3 class="panel-title">Choose a group</h3> </div> <div class="panel-body"> <form> <div class="section"> <h3>Are you in a group?</h3> <div id="in_group_button" class="btn-group" data-toggle="buttons"> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="in_group" value="true"> Yes </label> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="in_group" value="false"> No </label> </div> </div> <div class="in_group hidden section"> <div class="section"> <h3>Are you sharing the same computer?</h3> <div id="sharing_computer_button" class="btn-group" data-toggle="buttons"> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="sharing_computer" value="true"> Yes </label> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="sharing_computer" value="false"> No </label> </div> </div> <div class="sharing_computer hidden section"> <form> <div class="form-group"> <label class="control-label" for="group_name">What will be the name of your group?</label> <input class="form-control" type="text" name="group_name" placeholder="Group Name" id="group_name"> </div> <div class="form-group"> <label class="control-label" for="group_member_names">What will the usernames of everyone in the group be?</label> <input class="form-control" type="text" name="username1" placeholder="Username"> <input class="form-control" type="text" name="username2" placeholder="Username"> <button class="btn btn-default" id="add_user_btn">Add another person</button> </div> <div class="form-group"> <button class="btn btn-success submit">Create Group and Start Simulation</button> </div> </form> </div> <div class="not_sharing_computer hidden section"> <h3>Has someone already created the group? (make sure to talk to your team members about it)</h3> <div id="group_created_button" class="btn-group" data-toggle="buttons"> <label class="btn btn-default"> <input class="form-control" type="radio" autocomplete="off" name="group_already_created" value="true"> Yes </label> <label class="btn btn-default"> <input class="form-control" type="radio" autocomplete="off" name="group_already_created" value="false"> No </label> </div> <div class="group_not_created hidden section"> <div class="form-group"> <label class="control-label" for="group_name">What will be the group name?</label> <input class="form-control" type="text" name="group_name" placeholder="Group Name"> </div> <div class="form-group"> <label class="control-label" for="username">What will be your username?</label> <input class="form-control" type="text" id="username" name="username" placeholder="username"> </div> <div class="form-group"> <button class="btn btn-success submit">Start Simulation</button> </div> </div> <div class="group_created hidden section"> <div class="form-group"> <label class="control-label" for="group_name">What is the name of the group you want to join?</label> <input class="form-control" type="text" name="group_name" placeholder="Group Name"> </div> <div class="form-group"> <label class="control-label" for="username">What will be your username?</label> <input class="form-control" type="text" id="username" name="username" placeholder="username"> </div> <div class="form-group"> <button class="btn btn-success submit">Start Simulation</button> </div> </div> </div> </div> <div class="not_in_group hidden section"> <div class="form-group"> <label class="control-label" for="username">What will be your username?</label> <input class="form-control" type="text" id="username" name="username" placeholder="username"> </div> <div class="form-group"> <button class="btn btn-success submit">Start Simulation</button> </div> </div> </form> </div> </div>';

		case "page_section":
			return '<div class="page-section"> {content} </div>';
            
        case "section_with_img":
            return '<div class="page-section-with-img"> {content} </div>';
            
        case "page_header":
            return '<div class="page-header"> {content} </div>';

		case "binary_choice":
			return '<div class="choice choice-binary"> <div class="well clickable-well" data-choice-id="{id}" data-destination="{destination}"> {text} </div> </div>';
            
        case "binary_choice_person":
            return '<div class="choice choice-binary choice-person"> <div class="well clickable-well" data-choice-id="{id}" data-destination="{destination}"><img class="person_header" src="img/{name}_thumb.jpg"></img> {text} </div> </div>';
            
        case "binary_yesno_choice":
            return '<div class="choice choice-binary choice-yesno"> <div class="well clickable-well" data-choice-id="{id}" data-destination="{destination}"> {text} </div> </div>';

		case "prompt_choice":
			return '<div class="choice choice-prompt"> <p>{text}</p> <input class="form-control" type="text" data-choice-id="{id}" data-destination="{destination}" placeholder="Enter your response here"> </div>';

		case "question_choice":
			return '<div class="choice choice-question"> <p>{text}</p> <input class="form-control" type="text" data-choice-id="{id}" data-destination="{destination}" placeholder="Enter your response here"> </div>';

		case "btn":
		return "<button id='{id}' class='btn btn-default'>{text}<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span></button>";

		case "go_back_btn":
			return "<button id='go-back' class='btn btn-default'>Go Back</button>"

		default:
			throw "No template associated with a " + pageName + " page";
	}
};