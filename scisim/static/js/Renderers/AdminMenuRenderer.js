var AdminMenuRenderer = function(controller) {
    // Maybe should make these global imports like in the scisim app
    this.controller = controller;
    this.drawn = false;
};

/**
 * Generic render function that can be exposed to any controller. options
 * argument gives us flexibility but this process may need refactoring.
 *
 * @param  {object} options [hash of options key-valule pairs]
 */
AdminMenuRenderer.prototype.render = function(options) {
    console.log(options);
    if (!this.drawn) {
        var choices = options.choices;
        var templateInfo;
        var html = "";
        choices.forEach(function(choice) {
            templateInfo = {"title": choice.title, "desc": choice.description, "value": choice.value};
            html += tf.fillTemplate(templateInfo, "admin_menu");
        });
        ps.transitionPage(html);
        this.attachListeners();
        this.drawn = true;
    }
};

/**
 * Attach listeners to elements on page to pass back to controller
 */
 AdminMenuRenderer.prototype.attachListeners = function() {
    var $choices = $('.list-group-item');
    var $choice;
    for (var i=0; i<$choices.length; i++) {
        $choice = $($choices[i]);
        $choice.click(this.handleClicked.bind(this));
    }
 };

/**
 * Some more rendering-specific handling can be done here if necessary but
 * leave all logic to the controller
 */
AdminMenuRenderer.prototype.handleClicked = function(e) {
    // Some more rendering-specific handling can be done here if necessary but
    // leave all logic to the controller
    var choice = $(e.currentTarget).find("input").val();
    console.log("handleClicked passing " + value + " to controller");
    this.controller.handleEvent(choice);
};

AdminMenuRenderer.prototype.teardown = function() {
    this.drawn = false;
};

