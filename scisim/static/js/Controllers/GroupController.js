var GroupController = function(){
	this.render();
};

GroupController.prototype.render = function() {
	var template = tf.fillTemplate(null, "group_chooser");
	ps.transitionPage(tf.wrapInParent(template));
	this.$html = $('.section');

	this.init();
};

GroupController.prototype.init = function() {
	$("#in_group_button label").click(this.isInGroupToggle.bind(this));

	$("#sharing_computer_button label").click(this.isSharingComputerToggle.bind(this));

	$('#group_created_button label').click(this.groupCreatedToggle.bind(this));

	$('#add_user_btn').click(this.addUsernameInput.bind(this));

	$('.submit').click(this.handleSubmit.bind(this));
};

GroupController.prototype.isInGroupToggle = function(e) {
	var inGroup = $(e.target).children()[0].value;
	inGroup = (inGroup === "true") ? true : false;

	this.inGroup = inGroup;
	this.toggleButton(inGroup, $('.in_group'), $('.not_in_group'));
};

GroupController.prototype.isSharingComputerToggle = function(e) {
	var sharing = $(e.target).children()[0].value;
	sharing = (sharing === "true") ? true : false;

	this.sharingComputer = sharing;
	this.toggleButton(sharing, $('.sharing_computer'), $('.not_sharing_computer'));
};

GroupController.prototype.groupCreatedToggle = function(e) {
	var groupCreated = $(e.target).children()[0].value;
	groupCreated = (groupCreated === "true") ? true : false;

	this.groupAlreadyCreated = groupCreated;
	this.toggleButton(groupCreated, $('.group_created'), $('.group_not_created'));
};


GroupController.prototype.toggleButton = function(condition, $shownOnTrue, $shownOnFalse) {
	if(condition){
		$shownOnFalse.fadeOut().addClass("hidden");
		$shownOnTrue.hide().removeClass('hidden').fadeIn();
	}else{
		$shownOnTrue.fadeOut().addClass("hidden");
		$shownOnFalse.hide().removeClass('hidden').fadeIn();
	}
};

GroupController.prototype.addUsernameInput = function(e) {
	e.preventDefault();
	var inputs = $('.sharing_computer input');
	var newInput = $('<input class="form-control" type="text" name="username'+ (inputs.length - 1) +'" placeholder="Username">');

	inputs.eq(inputs.length - 1).after(newInput).hide().fadeIn();
};

GroupController.prototype.handleSubmit = function(e) {
	e.preventDefault();

	var $section = $(e.target).parent().parent();

	if(this.hasErrors($section)) return false;

	loader.show();
	var that = this;

	if(!this.inGroup){
		var username = $section.find('input[name=username]').val();
		this.unsetApiError($section);

		api.createUsers([username]).done(function(response){
			if(!that.hasApiError(response, $section)){
				localStorage.setItem("user_id", response.id);

				publisher.publish("changePage", [PageController, localStorage.getItem("first_page_id")]);
				loader.hide();
			}
		});
		return;
	}

	if(this.sharingComputer){
		var group_name = $section.find('input[name=group_name]').val();
		var usernames = [];
		var inputs = $section.find('input');

		for (var i = 1; i < inputs.length; i++) {
			usernames.push(inputs.eq(i).val());
		};

		// TODO: refactor this so that there aren't so many nested callbacks. Sorry!!

		api.createGroup(group_name, 0).done(function(response){
			if(that.hasApiError(response, $section)){
				return false;
			}
			localStorage.setItem("group_name", group_name);

			api.createUsers(usernames).done(function(){
				var responses = Array.prototype.slice.call(arguments, 0, arguments.length - 2);
				var errors = false;
				var user_ids = [];

				for (var i = 0; i < responses.length; i++) {
					user_ids.push(responses[i].id);

					if(!that.hasApiError(responses[i], $section)){
						for (var j = 1; j < inputs.length; j++) {
							if(inputs.eq(i).val() === responses[j]){
								inputs.eq(i).fadeOut().remove();
							}
						};
					}else{
						errors = true;
					}
				}

				if(errors){
					return;
				}

				localStorage.setItem("user_id", JSON.stringify(user_ids));

				api.addUsersToGroup(group_name, usernames).done(function(){
					var error = false;
					var responses = Array.prototype.slice.call(arguments, 0, arguments.length - 2);
					for (var i = 0; i < responses.length; i++) {
						if(!that.hasApiError(response[i], $section)){
							error = true
						}
					};

					if(!error){
						loader.hide();
						publisher.publish("changePage", [PageController, localStorage.getItem("first_page_id")]);
					}
				})
			});
		});
		return;
	}

	if(!this.sharingComputer && this.groupAlreadyCreated){
		var username = $section.find('input[name=username]').val();
		var group_name = $section.find('input[name=group_name]').val();

		api.createUsers([username]).done(function(response){
			if(that.hasApiError(response, $section)) return;

			localStorage.setItem("user_id", response.id);

			api.addUsersToGroup(group_name, [username]).done(function(response){
				if(that.hasApiError(response, $section)) return;

				localStorage.setItem("group_name", response.group_name);

				loader.hide();
				publisher.publish("changePage", [PageController, localStorage.getItem("first_page_id")]);
			});
		});
		return;
	}

	if(!this.sharingComputer && !this.groupAlreadyCreated){
		var username = $section.find('input[name=username]').val();
		var group_name = $section.find('input[name=group_name]').val();

		api.createGroup(group_name, 0).done(function(response){
			if(that.hasApiError(response, $section)) return;
			// TODO: what if users made a mistake, and then resubmit. The group would already be created and they couldn't get passed this point.
			// We could make it so that we ignore the error if we know it's going to fail
			localStorage.setItem("group_name", response.group_name);

			api.createUsers([username]).done(function(response){
				if(that.hasApiError(response, $section)) return;

				localStorage.setItem("user_id", response.id);

				api.addUsersToGroup(group_name, [username]).done(function (response) {
					if(that.hasApiError(response, $section)) return;

					loader.hide();
					publisher.publish("changePage", [PageController, localStorage.getItem("first_page_id")]);
				});
			});
		});
		return;
	}
};

GroupController.prototype.hasErrors = function($section) {
	// make sure to clean up user input before sending it across the wire
	var errors = false;
	var groups = $section.find('.form-group');

	for (var i = 0; i < groups.length; i++) {
		var group = groups.eq(i);
		var inputs = group.find('input[type=text]');

		for (var j = 0; j < inputs.length; j++) {
			var input = inputs.eq(j);
			if(input.val().length < 2){
				errors = true;
				group.addClass("has-error");
				if(input.next().prop("tagName") !== "P"){
					input.after($('<p class="text-danger">This field has to be more than 2 letters long</p>'));
				}
			}else{
				group.removeClass("has-error");
				if(input.next().prop("tagName") === "P"){
					input.next().remove();
				}
			}
		};
	};

	return errors;
};

// TODO: decouple these methods from this class. Maybe an APIHelper class? Or an addition/extension to the API class itself
GroupController.prototype.hasApiError = function(response, $section) {
	if(response.hasOwnProperty('error')){
		this.setApiError($section, response.error);
		loader.hide();
		return true;
	}

	return false;
};

GroupController.prototype.setApiError = function($section, error) {
	$section.find('.form-group').eq(0).append('<p id="api_error" class="text-danger">'+error+'</p>');
};

GroupController.prototype.unsetApiError = function($section) {
	$section.find("#api_error").remove();
};
