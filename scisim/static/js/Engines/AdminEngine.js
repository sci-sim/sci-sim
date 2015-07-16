/**
 * Handles switching out of controllers in the admin section of the application
 */
var AdminEngine = function() {
    this.controllers = null;
};

/**
 * Enum for Controllers managed by the admin engine.
 */
AdminEngine.CONTROLLERS = Object.freeze({
    ADMIN_MENU_CONTROLLER: "adminMenu",
    SIMULATION_EDITOR_CONTROLLER: "simulationEditor"
});

/**
 * Setup all the possible controllers here. Make this specific to admin engine
 * don't have to make code too generic right now.
 *
 * @return {[type]} [description]
 */
AdminEngine.prototype.init = function() {
    this.controllers = {
        "adminMenu": new AdminMenuController(this),
        "simulationEditor": new SimulationEditorController(this)
    };
};

/**
 * Handles switching of controllers. This method should be called by the
 * current controller which is given a reference to the engine. Whatever
 * tear-down and set-up procedures that need to be done on the controllers
 * should be done here if possible.
 *
 * @param changeTo [controller to change to]  ** possibly make this some event object rather than string literal
 */
AdminEngine.prototype.changeController = function(changeTo) {
    if (changeTo === AdminEngine.CONTROLLERS.ADMIN_MENU_CONTROLLER) {
        this.controllers["adminMenu"].rund();
    } else if (changeTo === AdminEngine.CONTROLLERS.SIMULATION_EDITOR_CONTROLLER) {
        this.controllers["simulationEditor"].run();
    }
};

/**
 * Starts the engine by running the initial (menu) controller which will render
 * the choice menu onto the web browser
 */
AdminEngine.prototype.start = function() {
    this.controllers["adminMenu"].run();
};
