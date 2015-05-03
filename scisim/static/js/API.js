var API = function(){}

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