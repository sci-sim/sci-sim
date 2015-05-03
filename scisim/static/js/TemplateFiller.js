var TemplateFiller = function(){};

TemplateFiller.prototype.fillTemplate = function(data, pageName) {
	var template = this.getTemplate(pageName);
	var html = "<div class='screen'>";

	if(data === null) return (html + template + "</div>");

	for (var i = 0; i < data.length; i++) {
		var sim = data[i].simulations;

		var title = sim[1].title,
			description = sim[5].desc,
			firstPageId = sim[6].first_page_id,
			sim_id = sim[0].id;
			parsed_template = template.replace("{sim_title}", title).replace("{sim_desc}", description).replace("{first_page_id}", firstPageId).replace("{sim_id}", sim_id);

		html += parsed_template;
	};

	return html += "</div>";
};

TemplateFiller.prototype.getTemplate = function(pageName) {
	switch(pageName){
		case "choose_simulation":
			return '<div class="list-group-item simluation-item clickable"><span class="badge"><i class="glyphicon glyphicon-chevron-right"></i></span> <div class="media"> <div class="media-left"> <a href="#"> <img class="media-object" src="img/page_1_s.jpg"> </a> </div> <div class="media-body"> <h4 class="media-heading list-item-heading">{sim_title}</h4> <p>{sim_desc}</p> <input type="hidden" value="{first_page_id}" name="first_page_id"> <input type="hidden" value="{sim_id}" name="sim_id"> </div> </div> </div>';	
			break;

		case "group_chooser":
			// get the template from the /js/templates directory...load them in with ajax later
			return '<div class="panel panel-default choose_group_panel"> <div class="panel-heading"> <h3 class="panel-title">Choose a group</h3> </div> <div class="panel-body"> <form> <div class="section"> <h3>Are you in a group?</h3> <div id="in_group_button" class="btn-group" data-toggle="buttons"> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="in_group" value="true"> Yes </label> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="in_group" value="false"> No </label> </div> </div> <div class="in_group hidden section"> <div class="section"> <h3>Are you sharing the same computer?</h3> <div id="sharing_computer_button" class="btn-group" data-toggle="buttons"> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="sharing_computer" value="true"> Yes </label> <label class="btn btn-default"> <input type="radio" autocomplete="off" name="sharing_computer" value="false"> No </label> </div> </div> <div class="sharing_computer hidden section"> <form> <div class="form-group"> <label class="control-label" for="group_name">What will be the name of your group?</label> <input class="form-control" type="text" name="group_name" placeholder="Group Name" id="group_name"> </div> <div class="form-group"> <label class="control-label" for="group_member_names">What will the usernames of everyone in the group be?</label> <input class="form-control" type="text" name="username1" placeholder="Username"> <input class="form-control" type="text" name="username2" placeholder="Username"> <button class="btn btn-default" id="add_user_btn">Add another person</button> </div> <div class="form-group"> <button class="btn btn-success submit">Create Group and Start Simulation</button> </div> </form> </div> <div class="not_sharing_computer hidden section"> <h3>Has someone already created the group? (make sure to talk to your team members about it)</h3> <div id="group_created_button" class="btn-group" data-toggle="buttons"> <label class="btn btn-default"> <input class="form-control" type="radio" autocomplete="off" name="group_already_created" value="true"> Yes </label> <label class="btn btn-default"> <input class="form-control" type="radio" autocomplete="off" name="group_already_created" value="false"> No </label> </div> <div class="group_not_created hidden section"> <div class="form-group"> <label class="control-label" for="group_name">What will be the group name?</label> <input class="form-control" type="text" name="group_name" placeholder="Group Name"> </div> <div class="form-group"> <label class="control-label" for="username">What will be your username?</label> <input class="form-control" type="text" id="username" name="username" placeholder="usernmae"> </div> <div class="form-group"> <button class="btn btn-success submit">Start Simulation</button> </div> </div> <div class="group_created hidden section"> <div class="form-group"> <label class="control-label" for="group_name">What is the name of the group you want to join?</label> <input class="form-control" type="text" name="group_name" placeholder="Group Name"> </div> <div class="form-group"> <label class="control-label" for="username">What will be your username?</label> <input class="form-control" type="text" id="username" name="username" placeholder="usernmae"> </div> <div class="form-group"> <button class="btn btn-success submit">Start Simulation</button> </div> </div> </div> </div> <div class="not_in_group hidden section"> <div class="form-group"> <label class="control-label" for="username">What will be your username?</label> <input class="form-control" type="text" id="username" name="username" placeholder="usernmae"> </div> <div class="form-group"> <button class="btn btn-success submit">Start Simulation</button> </div> </div> </form> </div> </div>';
			break;

		default:
			throw "No template associated with a " + pageName + " page";
			break;
	}
};