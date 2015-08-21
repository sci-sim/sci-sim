var AdminEngine = function () {
    // 1 - view all pages
    this.render(1);
};

AdminEngine.prototype.render = function(page_id){
    var html = "";
    loader.show();
    var $dfd = $.Deferred();
    var promise;

    switch (page_id){

        // 1 - view all pages
        case 1:
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
                return $dfd.promise();
            });
            break;
        // 2 - edit page
        case 2:
            break;
        // 3 - add new page
        case 3:
            break;
        default:
            throw "Page "+page_id+" does not exist";
    }

    promise.done(function(html){
        loader.hide();

        ps.transitionPage(html);
        this.init();
    }.bind(this));

};

AdminEngine.prototype.init = function(){
    // attach listeners here
    console.log('attaching listeners');
};
