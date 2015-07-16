/**
 * Responsible for handling the logic of the simulation editor. We may need several
 * views here but for now stick to the same pattern as AdminMenuController
 */
var SimulationEditorController = function(engine) {
    this.engine = engine;
    this.renderer = new SimulationEditorRenderer(this);
    // this.simulationEditor = new SimulationEditor();
};

/**
 * This method should be used by renderer to pass on events to controller.
 * The method should stay generic so that any renderer can count on any controller
 * having a handleEvent method. The renderer should not have to do any work or have
 * any knowledge of the controller past calling this method on any event. This method
 * should then do the work of deciding what to do afterwards.
 *
 * @param  {Event} e [Event passed from renderer to controller]
 */
SimulationEditorController.prototype.handleEvent = function(e) {
};

/**
 * Called by Engine to start this controller
 */
SimulationEditorController.prototype.run = function() {
    this.renderer.render(
        {
            "initial": true,
        }
    );
};
