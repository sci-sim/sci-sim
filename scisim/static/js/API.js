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

API.prototype.formatData = function(apiData) {
	// because the data from the api comes back weird. Use this make an array of flat objects
	// maybe this will be deprecated after a change in the api
	
	var formatted = [];

	for (var i = 0; i < apiData.length; i++) {
		for(var obj in apiData[i]){
			var newObject = objLoop(apiData[i]);
			formatted.push(newObject);	
		} 
	};

	return formatted;
};

function objLoop(originalObject){
	var newObj = {};
	
	for(var key in originalObject){
		var keyValue = originalObject[key];
		if($.isArray(keyValue)){

			for (var j = 0; j < keyValue.length; j++) {
				for(var objval in keyValue[j]){
					if($.isArray(keyValue[j][objval])){
						// for relationships
						newObj[objval] = objLoop(keyValue[j]);
					}else{
						newObj[objval] = keyValue[j][objval];	
					}
				}
			};
		}
	};
	return newObj;
}