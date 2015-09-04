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
                    if(current['sections'].length > 0){
                        var first_section = $(current['sections'][0]['content']).text().substr(0, 50)
                    }else{
                        var first_section = "No text";
                    }
                    var tmplData = {
                        'title': current['title'],
                        'id': current['id'],
                        'first_section': first_section,
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
            storageHelper.store('current_admin_page', 2);

            this.startMiniEngine(PageEditMiniEngine).done(function(e){
               this.render(1);
            }.bind(this));
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

    $('#admin-create-page').click(function(){this.render(3)}.bind(this))
};

AdminEngine.prototype.editSelectedPage = function(e){
    storageHelper.store('current_page_id', $(e.currentTarget).data('id'));
    this.render(2); // 2 = edit page
};