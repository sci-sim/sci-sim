var SimulationController = function(){
	this.render();
}

SimulationController.prototype.render = function() {
	loader.show();
	var that = this;

	api.getSimulations().then(function(sims){
		// TODO: make a backup plan if this fails
        var html = "";
        if ($.isArray(sims)) {
            for (var i = 1; i < sims.length; i++) {
    			var templateInfo = {"title": sims[i].title, "desc": sims[i].desc, "first_page_id": sims[i].first_page_id, "id": sims[i].id };
    			html += tf.fillTemplate(templateInfo, "choose_simulation");
    		};
        } else {
			var templateInfo = {"title": sims.title, "desc": sims.desc, "first_page_id": sims.first_page_id, "id": sims.id };
			html += tf.fillTemplate(templateInfo, "choose_simulation");
        }

        html += tf.fillTemplate({"id" : "open-admin-btn", "text": "Go to Admin view"}, "btn");
		html = tf.wrapInParent('screen',html);
		
		ps.transitionPage(html);
		loader.hide();

		that.init();
	});
};

SimulationController.prototype.init = function() {
	var $simItems = $('.list-group-item');
	for (var i = 0; i < $simItems.length; i++) {
		var $item = $($simItems[i]);
		$item.click(this.onSimItemClick.bind(this));
	};

    var $adminBtn = $('#open-admin-btn');
    $adminBtn.click(this.openAdminSection.bind(this));

};

SimulationController.prototype.onSimItemClick = function(e) {
	var page_id = $(e.currentTarget).find("input[name=first_page_id]").val();
	var sim_id = $(e.currentTarget).find("input[name=sim_id]").val();
	
	storageHelper.store('first_page_id', page_id);
	storageHelper.store('sim_id', sim_id);
    //storageHelper.store("is_admin" , true);

    if(storageHelper.get("is_admin")){
        new EngineStarter();
    }else{
        publisher.publish("changePage", [GroupController]);
    }

};

SimulationController.prototype.openAdminSection = function(e){
    // TODO: extract this to a LoginController
    var adminHtml = tf.fillTemplate(null, 'admin_login');
    $('body').append(adminHtml);
    var $loginContainer = $('.admin-login-container');

    $('#show_admin_submit').click(function(e){
        var username = $loginContainer.find("input").eq('0').val();
        var password = $loginContainer.find("input").eq('1').val();

        if(username === "melanie" && password === "secretadminpassword153"){
            storageHelper.store('is_admin', true);
            $('#open-admin-btn').text("Admin mode activated");
        }

        $loginContainer.hide().remove();
    });

    $('#show_admin_cancel').click(function(e){
        $loginContainer.hide().remove();
    });
};