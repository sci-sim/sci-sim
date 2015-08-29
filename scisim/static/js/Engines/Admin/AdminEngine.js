var AdminEngine = function () {
    // 1 - view all pages
    // 2 - edit page
    // 3 - create page
    this.render(1);
};

AdminEngine.prototype = Object.create(Engine.prototype);

AdminEngine.prototype.render = function(page_id){
    var html = "";
    html += tf.fillTemplate({'id': 'admin-back-btn', 'text': 'Go Back'}, 'btn');

    loader.show();
    var $dfd = $.Deferred();
    var promise;

    switch (page_id){

        // 1 - view all pages
        case 1:
            html = '';
            html += tf.fillTemplate(null, "admin_create_page_item");
            promise = api.getAllPages(storageHelper.get('sim_id')).then(function(pages){
                for(var i = 0; i < pages.length; i++){
                    var current = pages[i];
                    var tmplData = {
                        'title': current['title'],
                        'id': current['id'],
                        'first_section': $(current['sections'][0]['content']).text().substr(0, 50),
                        'section_count': current['sections'].length - 1,
                        'action_count': current['page_actions'].length,
                        'choice_count': current['choices'].length
                    };

                    html += tf.fillTemplate(tmplData, 'admin_page_selection_item');
                }

                html = tf.wrapInParent('page-selection-container', html);

                $dfd.resolve(html);
                return $dfd.finish();
            });

            storageHelper.store('current_admin_page', 1);
            break;

        // 2 - edit page
        case 2:
            promise = api.getPage(storageHelper.get('current_page_id')).then(function(page){
                var modifiers = page['page_modifiers'],
                    sections = page['sections'],
                    actions = page['page_actions'],
                    choices = page['choices'];

                html += tf.fillTemplate({'title': page['title']}, 'admin_edit_title');

                var section_section = '';
                for(var i = 0; i < sections.length; i++){
                    var section = sections[i];
                    section_section += tf.fillTemplate({
                        'id': section['id'],
                        'order': section['order'],
                        'text': section['content']
                    }, "admin_edit_section_item");
                }

                section_section = tf.wrapInParent('sections_section well', section_section);

                var choices_section = '';
                for(var i = 0; i < choices.length; i++){
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
                for(var i = 0; i < modifiers.length; i++){
                    var modifier = modifiers[i];
                    modifiers_section += tf.fillTemplate({
                        'id': modifier['id'],
                        'value':modifier['value'],
                        'name': modifier['name']
                    }, 'admin_edit_modifier_item');
                }

                modifiers_section = tf.wrapInParent('modifiers_section well', modifiers_section);

                var actions_section = '';
                for(var i = 0; i < actions.length; i++){
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

                html += tf.fillTemplate({'id' : 'admin-edit-page-submit', 'text': 'update'}, 'btn');

                $dfd.resolve(html);
                return $dfd.finish();
            });
            storageHelper.store('current_admin_page', 2);
            break;
        // 3 - add new page
        case 3:
            storageHelper.store('current_admin_page', 3);

            this.startMiniEngine(PageCreationMiniEngine).done(function(e){
                this.render(1);
            }.bind(this));

            break;
        default:
            throw "Page "+page_id+" does not exist";
    }

    if(promise === undefined){
        loader.hide();
        return;
    }

    promise.done(function(html){
        loader.hide();

        ps.transitionPage(html);
        this.init();
    }.bind(this));

};

AdminEngine.prototype.init = function(){
    $('.page-selection-item').click(this.editSelectedPage.bind(this));

    $('#admin-back-btn').click(function(e){
        this.render(storageHelper.get('current_admin_page') - 1);
    }.bind(this));

    $('.section-text img').click(this.openImageUploader.bind(this));

    $('#admin-edit-page-submit').click(this.updatePage.bind(this));

    $('#admin-create-page').click(function(){this.render(3)}.bind(this))
};

AdminEngine.prototype.editSelectedPage = function(e){
    storageHelper.store('current_page_id', $(e.currentTarget).data('id'));
    this.render(2); // 2 = edit page
};

AdminEngine.prototype.openImageUploader = function(e){

};

AdminEngine.prototype.updatePage = function(e){
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
           this.render(storageHelper.get('current_page_id'));
        }.bind(this), {ok: "Okay, thanks!"});
    });
};
