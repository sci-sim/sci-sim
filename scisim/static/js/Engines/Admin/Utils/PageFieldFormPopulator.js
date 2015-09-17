var PageFieldFormPopulator = function ($container) {
    this.$container = $container;

    this.$container.append(tf.fillTemplate({"id": "admin-create-page-fields"}, 'container'));
    $('#admin-create-page-fields').append(tf.fillTemplate(null, "admin_create_page_form"));

    $('.page-selection-item').click(this.findFieldToAdd.bind(this));
};

PageFieldFormPopulator.prototype.fillSelectBoxes = function(){
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

PageFieldFormPopulator.prototype.findFieldToAdd = function(e){
    var $elem = $(e.currentTarget);
    var id = $elem.attr('id');
    var field= id.slice(id.lastIndexOf('-')+1);

    this.addField(field);
};

PageFieldFormPopulator.prototype.addField = function(field){
    var $newField = $(tf.fillTemplate(null, "admin-create-"+field+"-field"));
    $('#admin-create-page-fields').before($newField);

    $newField.find(".delete-btn").click(this.removeField.bind(this));

    this.fillSelectBoxes();
};

PageFieldFormPopulator.prototype.removeField = function(e){
    var confirmDelete = confirm("Are you sure you want to delete this section?");
    if(confirmDelete === true){
        $(e.currentTarget).parent().remove();
    }
};

PageFieldFormPopulator.prototype.save = function(){
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
    loader.hide();

    if(deferreds.length === 0){
        return false;
    }else{
        return $.when.apply(this, deferreds);
    }
};
