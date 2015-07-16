/**
 * This object will have information about the state of the admin menu. Right now,
 * we don't have to worry about too many features, but in the future, this may be
 * useful for persistance, keeping track of state, etc...
 */
var AdminMenu = function() {
    this.choices = [
        {
            "title": "Generate Reports",
            "description": "Click here to generate reports on SCI",
            "value": AdminMenu.CHOICES.GENERATE_REPORTS
        },
        {
            "title": "SCI Simulation Editor",
            "description": "Click here to edit/create SCI simulations.",
            "value": AdminMenu.CHOICES.SIMULATION_EDITOR
        }
    ];
};

/**
 * Enum for menu choices
 */
AdminMenu.CHOICES = Object.freeze({
    GENERATE_REPORTS: "Generate Reports",
    SIMULATION_EDITOR: "Simulation Editor"
});
