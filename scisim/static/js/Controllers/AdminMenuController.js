/**
 * AdminMenuController will be responsible for creating its own links to its
 * renderer and its model. It will also have a backlink to the engine to handle
 * changing controllers.
 *
 * @param {AdminEngine} engine [Back reference to engine running the controller]
 */
var AdminMenuController = function(engine) {
    this.engine = engine;
    this.renderer = new AdminMenuRenderer(this);

    // Gives us info about state of AdminMenu model
    this.adminMenu = new AdminMenu();
    this.reportGenerator = new ReportGenerator();
};

/**
 * This method should be used by renderer to pass on events to controller.
 * The method should stay generic so that any renderer can count on any controller
 * having a handleEvent method. The renderer should not have to do any work or have
 * any knowledge of the controller past calling this method on any event. This method
 * should then do the work of deciding what to do afterwards
 *
 * @param  {Event} e [Event passed from renderer to controller]
 */
AdminMenuController.prototype.handleEvent = function(e) {
    if (e === AdminMenu.CHOICES.GENERATE_REPORTS) {

    } else if (e === AdminMenu.CHOICES.SIMULATION_EDITOR) {
        this.teardown();
        this.engine.changeController(AdminEngine.CONTROLLERS.SIMULATION_EDITOR_CONTROLLER);
    }
};

/**
 * Called by Engine to start this controller
 */
AdminMenuController.prototype.run = function() {
    console.log("hi");
    this.renderer.render(
        {
            "initial": true,
            "choices": this.adminMenu.choices
        }
    );
};

/**
 * Handles teardown of the controller. Should be called before handing off control
 * to the engine to change controllers. Wait to see if we'll need a corresponding
 * setup method.
 */
AdminMenuController.prototype.teardown = function() {
    this.renderer.teardown();
};
