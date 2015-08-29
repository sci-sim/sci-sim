var PageCreationMiniEngine = function (deferred) {
    MiniEngine.call(this, deferred);
    this.render();
};

PageCreationMiniEngine.prototype = Object.create(MiniEngine.prototype);

PageCreationMiniEngine.prototype.render = function(){
    var html = "";
    html += tf.fillTemplate({'id':'page-title', 'placeholder' :'ex: introduction1', 'type':'text','name':'page-title', 'label': 'Page title:'}, 'input');
    html+= tf.fillTemplate({"id": "admin-create-page-fields"}, 'container');
    html += tf.fillTemplate(null, "admin_create_page_form");
    html += tf.fillTemplate({'id': 'submit-btn', 'text': 'Create Page'}, 'btn');

    ps.transitionPage(html);
    this.init();
};

PageCreationMiniEngine.prototype.init = function(){
    $('#submit-btn').click(this.finishPageCreation.bind(this));

    $('.page-selection-item').click(this.findFieldToAdd.bind(this));
};

PageCreationMiniEngine.prototype.findFieldToAdd = function(e){
    var $elem = $(e.currentTarget);
    var id = $elem.attr('id');
    var field= id.slice(id.lastIndexOf('-')+1);

    this.addField(field);
};

PageCreationMiniEngine.prototype.addField = function(field){
    var $container = $('#admin-create-page-fields');
    $container.append(tf.fillTemplate(null, "admin-create-"+field+"-field"));
};

PageCreationMiniEngine.prototype.finishPageCreation = function(e){
    this.finish();
};
