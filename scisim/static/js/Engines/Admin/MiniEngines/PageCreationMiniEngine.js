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
    $('#submit-btn').click(this.createPage.bind(this));
    $('button#go-back').click(function(){
        this.finish();
    }.bind(this));

    $('.page-selection-item').click(this.findFieldToAdd.bind(this));
};

PageCreationMiniEngine.prototype.fillSelectBoxes = function(){
    // {"name": "inputType"}
    var actionValues = {'add_to_notebook': 'text', 'show_patient_choices': 'boolean'};
    var modifierValues = ['goes_to_page', 'minimum_choices', 'minimum_choices_reached'];
    var $selectBoxes = $('select[name="action-value"]');

    for(var name in actionValues){
        var value = actionValues[name];

        var $html = $(tf.fillTemplate({'value': name, 'text': name.replace(/_/g, " ")}, 'option'));
        $selectBoxes.last().append($html);

        //  TODO: finish this. when you switch an option, the value should update with an appropriate box.
        //var $sibling = $html.parent().next().find('input');
        //
        //switch(value){
        //    case "text":
        //        break;
        //    case "boolean":
        //        var $newHtml = $('<select class="form-control" name="'+$sibling.attr('name')+'"></select>');
        //        $newHtml.html(
        //            tf.fillTemplate({'value': 'true','text': 'True'}, 'option') +
        //            tf.fillTemplate({'value': 'true','text': 'True'}, 'option')
        //        );
        //
        //        $sibling.replaceWith($newHtml);
        //        break;
        //}
    }

    for(var i = 0; i< modifierValues.length; i++){
        var html = tf.fillTemplate({'value': modifierValues[i], 'text': modifierValues[i].replace('_', " ")}, 'option');
        html = $(html).css('text-transform', 'capitalize');

        $('select[name="modifier-value"]').html(html);
    }
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

    this.fillSelectBoxes();
};

PageCreationMiniEngine.prototype.createPage = function(){
    api.createModel('page', {'title': $('input[name="page-title"]').val(), 'sim_id': storageHelper.get('sim_id')}).then(function(page){
        storageHelper.store('current_page_id', page.id);
        this.finishPageCreation();
    }.bind(this));
};

PageCreationMiniEngine.prototype.finishPageCreation = function(){
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
