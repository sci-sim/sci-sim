var PageFieldFormPopulator = function (deferred) {
    MiniEngine.call(this, deferred);
    this.render();
};

PageFieldFormPopulator.prototype = Object.create(MiniEngine.prototype);

PageFieldFormPopulator.prototype.render = function(){
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

PageFieldFormPopulator.prototype.init = function(){
    new PageFieldFormPopulator();

    $('#submit-btn').click(this.createPage.bind(this));
    $('button#go-back').click(function(){
        this.finish();
    }.bind(this));
};


PageFieldFormPopulator.prototype.createPage = function(){
    api.createModel('page', {'title': $('input[name="page-title"]').val(), 'sim_id': storageHelper.get('sim_id')}).then(function(page){
        storageHelper.store('current_page_id', page.id);
        this.finishPageCreation();
    }.bind(this));
};

PageFieldFormPopulator.prototype.finishPageCreation = function(){
    var valObj = {
        "sections": [],
        "choices": [],
        "modifiers": [],
        "actions": []
    };

    loader.show();

    var deferreds = [];
    // collect all the values
    for(var key in valObj){
        var singular = key.substr(0, key.length - 1);
        var $elems = $("." + singular + "-item");

        for(var i = 0; i < $elems.length; i++){
            var $elem = $elems.eq(i);
            var sectionVaues = {};

            switch(key){
                case "sections":
                    sectionVaues['content'] = $elem.find('textarea').val();
                    sectionVaues['show'] = true;
                    break;

                case "choices":
                    sectionVaues['text'] = $elem.find('textarea').val();
                    sectionVaues['destination'] = $elem.find('select[name="choice-destination"]').val();
                    sectionVaues['type'] = $elem.find('select[name="choice-type"]').val();
                    break;

                case "modifiers":
                    singular = "page_modifier";
                    sectionVaues['name'] = $elem.find('select[name="modifier-value"]').val();
                    sectionVaues['value'] = $elem.find('input[name="modifier-name"]').val();
                    break;

                case "actions":
                    singular = "page_action";
                    sectionVaues['name'] = $elem.find('select[name="action-value"]').val();
                    sectionVaues['value'] = $elem.find('input[name="action-name"]').val();
                    break;
            }

            sectionVaues['page_id'] = storageHelper.get('current_page_id');
            deferreds.push(api.createModel(singular, sectionVaues));
        }
    }

    $.when.apply(this, deferreds).then(function(){
        loader.hide();
        this.finish();
    }.bind(this));
};
