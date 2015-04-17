# Source files for the DEMO simulation
# Licensed under TODO

from scisim import db, next_id
from scisim.models import Simulation, Page, Section, Link, Prompt, Action

sim_demo = Simulation(title="Demonstration Simulation",
                      desc="This is a demo simulation used to show-off the features of the Sci-Sim engine. The password is \"d3m0\". Give it a try!",
                      folder_name="sim_demo",
                      preview_image_filename="page_1_s.jpg",
                      password="d3m0",
                      enabled=True,
                      order=0)
db.session.add(sim_demo)
db.session.commit()

# TODO do we need to specify parent_page_id on each PageSection, or does that get set for us automagically

# page 1
page1 = Page(id=next_id(), sim=sim_demo, title="Introduction")
page1.sections = [
   Section(show="True", order=0,
           content="<p>Each page of the simulation engine consists of multiple sections of HTML content. The visibility of each section can be programatically determined based on the user's choices in the simulation.</p>"),
   Section(show="{foo} == 1", order=1,
           content="<p>This is the second section, only shown if \"foo == 1\".</p>"),
   Section(show="True", order=2,
           content="<p>This is the third section (the second section is only shown if foo==1), which is always shown. Each page has one or more outgoing links. Each link's visibility is programatically determined in the same way as the pages. Each link can have an optional prompt and text-entry box to collect input from the student.</p>"),
]
db.session.add(page1)

# page 2
page2 = Page(id=next_id(), sim=sim_demo, title="Second page")
page2.sections = [
   Section(show="True", order=0,
           content="This is some content for page 2, in section 1."),
]
db.session.add(page2)

# Commit the pages to the database so that we can use their objects in creating the links.
# I am not sure this is necessary, but it certainly doesn't hurt.
db.session.commit()


# set up page links - Ordering is only evaluated for links with the same source page, and prompts within a link
db.session.add_all([
   Link(page_src=page1, order=1, page_dest=page2, show="True", show_well=True,
        top_text="This is the link top text for link 1, with show_well=True", button_text="Continue",
        prompts=[
           Prompt(order=0, prompt="Which animal do you like?", var_name="animal"),
           Prompt(order=1, prompt="Why did you pick that animal?", text_area=True, var_name="justification"),
           Prompt(order=2, prompt="Any other feedback? (optional)", var_name="other", required=False),
        ],
        actions=[
           Action(type=Action.ACTION_LOG, action_string="Selected animal \"{animal}\" with justification \"{justification}\"."),
           Action(type=Action.ACTION_LOG, action_string="Other comments: \"{other}\""),
           Action(type=Action.ACTION_NOTE, action_string="Selected animal \"{animal}\" with justification \"{justification}\".", icon="icon-pencil"),
           Action(type=Action.ACTION_VAR, action_string="foo = 1"),
           Action(type=Action.ACTION_VAR, action_string="bar = {foo} + 5"),
           Action(type=Action.ACTION_VAR, action_string="baz = True"),
           Action(type=Action.ACTION_VAR, action_string="animal = \"{animal}\""),
           Action(type=Action.ACTION_VAR, action_string="justification = \"{justification}\""),
        ]),
   Link(page_src=page1, order=0, page_dest=page2, show="True", show_well=False,
        top_text="This is the link top text for link 2, with show_well=False", button_text="Pick me!",
        prompts=[
           Prompt(order=0, prompt="Which animal do you like?", var_name="animal"),
           Prompt(order=1, prompt="Why did you pick that animal?", text_area=True, var_name="justification"),
           Prompt(order=2, prompt="Any other feedback? (optional)", var_name="other", required=False),
        ],
        actions=[
           Action(type=Action.ACTION_LOG, action_string="Selected animal \"{animal}\" with justification \"{justification}\"."),
           Action(type=Action.ACTION_LOG, action_string="Other comments: \"{other}\""),
           Action(type=Action.ACTION_NOTE, action_string="Selected animal \"{animal}\" with justification \"{justification}\".", icon="icon-pencil"),
           Action(type=Action.ACTION_VAR, action_string="foo = 1"),
           Action(type=Action.ACTION_VAR, action_string="bar = {foo} + 5"),
           Action(type=Action.ACTION_VAR, action_string="baz = True"),
           Action(type=Action.ACTION_VAR, action_string="animal = \"{animal}\""),
           Action(type=Action.ACTION_VAR, action_string="justification = \"{justification}\""),
        ]),
])

# set the simulation's first page
sim_demo.first_page_id = page1.id
db.session.commit()

