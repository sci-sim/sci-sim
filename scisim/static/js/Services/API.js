var API = function(){};

API.prototype.getSimulations = function(func) {
	return $.ajax({
		url: '/api/simulations/all',
		type:'GET'
	});
};

// implement this later..need to figure out how to get around promises
API.prototype.fetchTemplate = function(templateName) {
	return $.get("templates/" + templateName + ".html");
};

API.prototype.createUsers = function(users) {
	var defferedResponses = [];

	for (var i = 0; i < users.length; i++) {
		defferedResponses.push($.ajax({
			url:'/api/users/create',
			type: "POST",
			data: {"username": users[i], "sim_id": localStorage.getItem("sim_id")}
		}));
	};

	return $.when.apply(this, defferedResponses);
};

API.prototype.createGroup = function(group_name, shared) {
	return $.ajax({
		url: '/api/groups/create',
		type: "POST",
		data: {"group_name":group_name, "shared_computer": shared}
	});
};

API.prototype.addUsersToGroup = function(group_name, users) {
	var deferreds = [];
	for (var i = 0; i < users.length; i++) {
		deferreds.push(
			$.ajax({
				url: "/api/groups/add_user",
				type: "POST",
				data:{"group_name": group_name, 'username': users[i]}
			})
		);
	};

	return $.when.apply(this, deferreds);
};

API.prototype.getPage = function(page_id) {
	return $.ajax({
		url:"/api/page",
		type: "POST",
		data: {"page_id": page_id}
	});
};

API.prototype.logUserAction = function(current_page, user_id, action_string) {
	return $.ajax({
		url: "/api/users/log",
		type: "POST",
		data: {"page_id": current_page, "user_id": user_id, "action_string": action_string}
	});
};

API.prototype.aggregateRequests = function(func, params) {
	var deffereds = [];
	for (var i = 0; i < params.length; i++) {
		deffereds.push(func.apply(null, params[i]));
	};

	return $.when.apply(this, deffereds);
};

API.prototype.getAllPages = function(sim_id){
    return $.ajax({
        url:'/api/simulations/pages',
        type:'POST',
        data: {'sim_id':sim_id}
    });
};

API.prototype.updateModel = function(model, id, data){
    return $.ajax({
        url:"/api/models/update",
        type: 'PUT',
        data: $.extend({'model':model, 'id':id}, data)
    });
};

API.prototype.createModel = function(model, data){
    return $.ajax({
        url:"/api/models/create",
        type: 'POST',
        data: $.extend({'model':model}, data)
    });
};

API.prototype.getResponses = function() {
	return Array.prototype.slice.call(arguments, 0, arguments.length - 2);
};