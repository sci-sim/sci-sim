var PageEditMiniEngine = function (deferred) {
    MiniEngine.call(this, deferred);
    this.render();
};

PageEditMiniEngine.prototype = Object.create(MiniEngine.prototype);

PageEditMiniEngine.prototype.render = function() {
    var html = "";

    html += tf.fillTemplate(null, 'go_back_btn');

    api.getPage(storageHelper.get('current_page_id')).then(function (page) {
        var modifiers = page['page_modifiers'],
            sections = page['sections'],
            actions = page['page_actions'],
            choices = page['choices'];

        html += tf.fillTemplate({'title': page['title']}, 'admin_edit_title');

        var section_section = '';
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            section_section += tf.fillTemplate({
                'id': section['id'],
                'order': section['order'],
                'text': section['content']
            }, "admin_edit_section_item");
        }

        section_section = tf.wrapInParent('sections_section well', section_section);

        var choices_section = '';
        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];
            choices_section += tf.fillTemplate({
                'id': choice['id'],
                'text': choice['text'],
                'destination': choice['destination'],
                'type': choice['type'],
            }, "admin_edit_choice_item");
        }

        choices_section = tf.wrapInParent('choices_section well', choices_section);

        var modifiers_section = '';
        for (var i = 0; i < modifiers.length; i++) {
            var modifier = modifiers[i];
            modifiers_section += tf.fillTemplate({
                'id': modifier['id'],
                'value': modifier['value'],
                'name': modifier['name']
            }, 'admin_edit_modifier_item');
        }

        modifiers_section = tf.wrapInParent('modifiers_section well', modifiers_section);

        var actions_section = '';
        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            actions_section += tf.fillTemplate({
                'id': action['id'],
                'name': action['name'],
                'value': action['value']
            }, 'admin_edit_action_item');
        }

        actions_section = tf.wrapInParent('actions_section well', actions_section);

        html += section_section + choices_section + modifiers_section + actions_section;
        html = tf.wrapInParent('edit_page_container', html);

        html += tf.fillTemplate({'id': 'admin-edit-page-submit', 'text': 'update'}, 'btn');

        ps.transitionPage(html);
        this.init();
    }.bind(this));
};

PageEditMiniEngine.prototype.init = function(e){
    $('#admin-edit-page-submit').click(this.updatePage.bind(this));
    $('.section-text img').click(this.openImageUploader.bind(this));

    $('button#go-back').click(function(){
        this.finish();
    }.bind(this));
};

PageEditMiniEngine.prototype.openImageUploader = function(){

};

PageEditMiniEngine.prototype.updatePage = function(e){
    var params = [],
        elems = [];

    // iterate over sections
    var $sections = $('.section-item');
    for(var i = 0; i < $sections.length; i++){
        var $section = $sections.eq(i);
        var content = $section.find('.section-text').html();
        params.push([
            'section',
            $section.data('id'),
            {
                'content': content
            }
        ]);
        elems.push($section);
    }

    var $choices = $('.choice-item');
    for(var i = 0; i < $choices.length; i++){
        var $choice = $choices.eq(i),
            text = $choice.find('.choice-text').text(),
            destination = $choice.find('.choice-destination').text(),
            type = $choice.find('.choice-type').text();

        params.push([
            'choice',
            $choice.data('id'),
            {
                'text':text,
                'destination':destination,
                'type':type
            }
        ]);
        elems.push($choice);
    }

    $actions = $('.action-item');
    for(var i =0; i < $actions.length; i++){
        var $action = $actions.eq(i),
            name = $action.find('.action-name').text(),
            value = $action.find('.action-value').text();

        params.push([
            'page_action',
            $action.data('id'),
            {
                'name': name,
                'value': value
            }
        ]);
        elems.push($action);
    }

    $modifiers = $('.modifier-item');
    for(var i =0; i < $modifiers.length; i++){
        var $modifier = $modifiers.eq(i),
            name = $modifier.find('.modifier-name').text(),
            value = $modifier.find('.modifier-value').text();

        params.push([
            'page_modifier',
            $modifier.data('id'),
            {
                'name': name,
                'value': value
            }
        ]);

        elems.push($modifier);
    }

    api.aggregateRequests(api.updateModel, params).then(function(){
        var args = $.extend({}, arguments);
        var errors = false;

        for(var i = 0; i < args; i++){
            var response = args[i][0];
            if(!response.hasOwnProperty('success')){
                elems[i].addClass('errors');
                errors = true;
            }
        }

        if(errors){
            var message = 'Oh no! Something went wrong. The sections in red could not be saved.';
        }else{
            var message = "Everything was saved successfully!";
        }

        smoke.alert(message, function (e) {
            this.finish();
        }.bind(this), {ok: "Okay, thanks!"});
    }.bind(this));
};
