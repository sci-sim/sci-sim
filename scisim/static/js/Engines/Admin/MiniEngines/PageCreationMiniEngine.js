var PageCreationMiniEngine = function (deferred) {
    MiniEngine.call(this, deferred);
    this.render();
};

PageCreationMiniEngine.prototype = Object.create(MiniEngine.prototype);

PageCreationMiniEngine.prototype.render = function(){
    var html = "";
    html += tf.fillTemplate(null, 'go_back_btn');
    html += "<br/>";
    html += tf.fillTemplate({'id':'page-title', 'placeholder' :'ex: introduction1', 'type':'text','name':'page-title', 'label': 'Page title:'}, 'input');
    html+= tf.fillTemplate({"id": "admin-create-page-fields"}, 'container');
    html += tf.fillTemplate(null, "admin_create_page_form");
    html += tf.fillTemplate({'id': 'submit-btn', 'text': 'Create Page'}, 'btn');

    ps.transitionPage(html);
    this.init();
};

PageCreationMiniEngine.prototype.init = function(){
    this.populator = new PageFieldFormPopulator($('#admin-create-page-fields'));

    $('#submit-btn').click(this.createPage.bind(this));
    $('button#go-back').click(function(){
        this.finish();
    }.bind(this));
};


PageCreationMiniEngine.prototype.createPage = function(){
    api.createModel('page', {'title': $('input[name="page-title"]').val(), 'sim_id': storageHelper.get('sim_id')}).then(function(page){
        storageHelper.store('current_page_id', page.id);
        this.populator.save();
    }.bind(this));
};