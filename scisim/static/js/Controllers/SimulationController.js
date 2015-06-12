var SimulationController = function($parent){
	this.$parent = $parent;
	this.render();
};

SimulationController.prototype.render = function() {
	loader.show();
	var that = this;

	api.getSimulations().then(function(sims){
		// TODO: make a backup plan if this fails
		var html = "";
		for (var i = 1; i < sims.length; i++) {
			var templateInfo = {"title": sims[i].title, "desc": sims[i].desc, "first_page_id": sims[i].first_page_id, "id": sims[i].id };
			html += tf.fillTemplate(templateInfo, "choose_simulation");
		}

		html = tf.wrapInParent(html);

		ps.transitionPage(html);
		loader.hide();

		that.init();
	});
};

SimulationController.prototype.init = function() {
	var $simItems = $('.list-group-item');
	for (var i = 0; i < $simItems.length; i++) {
		var $item = $($simItems[i]);
		$item.click(this.onItemClick.bind(this));
	}
};

SimulationController.prototype.onItemClick = function(e) {
	var page_id = $(e.currentTarget).find("input[name=first_page_id]").val();
	var sim_id = $(e.currentTarget).find("input[name=sim_id]").val();

	localStorage.setItem('first_page_id', page_id);
	localStorage.setItem('sim_id', sim_id);

	publisher.publish("changePage", [GroupController]);
};
