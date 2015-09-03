var PageFieldFormPopulator = function ($container) {
    this.$container = $container;
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
    this.$container.append(tf.fillTemplate(null, "admin-create-"+field+"-field"));
    this.fillSelectBoxes();
};