var PageCreationMiniEngine = function (deferred) {
    MiniEngine.call(this, deferred);
    this.render();
};

PageCreationMiniEngine.prototype = Object.create(MiniEngine.prototype);

PageCreationMiniEngine.prototype.render = function(){
    var html = tf.fillTemplate(null, "admin_create_page_form");
    html += tf.fillTemplate({'id': 'submit-btn', 'text': 'Create Page'}, 'btn');
    ps.transitionPage(html);
    this.init();
};

PageCreationMiniEngine.prototype.init = function(){
    $('#submit-btn').click(this.finishPageCreation.bind(this));

};


PageCreationMiniEngine.prototype.finishPageCreation = function(e){
    this.finish();
};
