from scisim import db, defines


class Simulation(db.Model):
    __tablename__ = "simulations"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100))
    folder_name = db.Column(db.String(50))
    preview_image_filename = db.Column(db.String(50), default="none")
    preview_image_credit = db.Column(db.String(200))
    desc = db.Column(db.String(500))
    first_page_id = db.Column(db.Integer)
    #, db.ForeignKey("pages.id")) # TODO how do we fix this? -- we could have a convention. sim 1 starts at 100, 101, 102... and sim 2 starts at 200,201,202...
    # TODO should we make a first_page relationship instead of the ID here? This is just fine.
    order = db.Column(db.Integer, default=9999)

    password = db.Column(db.String(50))
    enabled = db.Column(db.Boolean(), default=True)

    # Whatever HTML you want to show up on the Library page, currently it is
    # static and unchanging per simulation, but eventually it could be awesome
    # and dynamic, exposing new information as you visit different pages.
    show_library = db.Column(db.Boolean, default=False)
    library = db.Column(db.String(5000), default="")

    # A one-to-many relationship between a simulation and its pages
    pages = db.relationship("Page", back_populates="sim")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    # A one-to-many relationship between a simulation and its users
    # EDIT: this can now be accessed through the sim_users pivot table.
    # users = db.relationship("User", back_populates="sim")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Simulation %d - \"%s\">" % (int(self.id), self.title)


class Page(db.Model):
    """ A page has one or more sections, and one or more outgoing links. """
    __tablename__ = "pages"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), default="")

    # A one-to-many relationship between a simulation and its pages
    sim_id = db.Column(db.Integer, db.ForeignKey("simulations.id"))
    sim = db.relationship("Simulation", back_populates="pages")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    # A one-to-many relationship between a page and its sections
    sections = db.relationship("Section", back_populates="page")

    page_modifiers = db.relationship("Page_Modifier", back_populates="page")
    choices = db.relationship("Choice", back_populates="page")
    page_actions = db.relationship("Page_Action", back_populates="page")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    # Two one-to-many relationships between a page and its incoming and outgoing links
    links_outgoing = db.relationship("Link", back_populates="page_src", foreign_keys="Link.page_src_id")
    links_incoming = db.relationship("Link", back_populates="page_dest", foreign_keys="Link.page_dest_id")
    # Manuallynually doing the bidirectional one-to-many / many-to-one linking of relationships
    #   

# this is to tell the client that the page needs to be modified somehow
# Like if the page needs to have a minimum number of choices chosen, we specify it here.
class Page_Modifier(db.Model):
    __tablename__ = "page_modifiers"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.String(200))
    value = db.Column(db.String(200))

    page_id = db.Column(db.Integer, db.ForeignKey("pages.id"))
    page = db.relationship("Page")


class Choice(db.Model):
    __tablename__ = "choices"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # this could be binary (option that is one or the other) or text
    type = db.Column(db.String(200))

    # the text to go with the choice.
    text = db.Column(db.String(200))

    #the page where this choice leads to.
    destination = db.Column(db.String(200))

    #in order to grab a group
    tag = db.Column(db.String(200))

    page_id = db.Column(db.Integer, db.ForeignKey("pages.id"))
    page = db.relationship("Page")

# this is to tell the client what needs to be done when the page loads.
# So if when the page loads we need to add something to the lab notebook, we can tell it to here.
class Page_Action(db.Model):
    __tablename__ = "actions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.String(200))
    value = db.Column(db.String(200))

    page_id = db.Column(db.Integer, db.ForeignKey("pages.id"))
    page = db.relationship("Page")

    def __repr__(self):
        return "<Page_Modifier %d - \"%s\">" % (int(self.id), self.title)

class Section(db.Model):
    __tablename__ = "sections"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.String(10000))
    order = db.Column(db.Integer, default=0)

    # This string is evaluated using the user's variables to determine if the section should be displayed
    show = db.Column(db.String(defines["EVAL_STRING_LEN"]), default="True")

    # A one-to-many relationship between a page and its sections
    page_id = db.Column(db.Integer, db.ForeignKey("pages.id"))
    page = db.relationship("Page", back_populates="sections")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Section %d - Page: %d>" % (int(self.id), int(self.page_id))


class Link(db.Model):
    """ Outgoing links from a page.
    Can be selectively shown based on the evaluation of the 'show' variable.
    Has different display options (show_well, button_text) and can have zero or more prompts.
    A link can only have one source and one destination page.
    A link can have zero or more link actions, including:
        Updating the value of a variable based on an expression (which could be "1", "{var} + 1", etc)
        Making an entry in the user's notebook
        Making an entry in the user's non-visible SCISIM log (includes pageloads, etc)
    """
    __tablename__ = "links"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order = db.Column(db.Integer, default=0)

    # This string is evaluated using the user's variables to determine if the link should be displayed
    show = db.Column(db.String(defines["EVAL_STRING_LEN"]), default="True")

    # There is always a button
    button_text = db.Column(db.String(200), default="Continue")

    # If you want you can put some header text at the top of the link. Only display if not empty.
    top_text = db.Column(db.String(100), default="")

    # Whether or not to put the link in a well and number it
    show_well = db.Column(db.Boolean(), default=False)

    # Relationships to source and destination pages
    page_src_id = db.Column(db.Integer, db.ForeignKey("pages.id"))
    page_src = db.relationship("Page", back_populates="links_outgoing", foreign_keys="Link.page_src_id")
    page_dest_id = db.Column(db.Integer, db.ForeignKey("pages.id"))
    page_dest = db.relationship("Page", back_populates="links_incoming", foreign_keys="Link.page_dest_id")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    # A one-to-many relationship between a link and its prompts
    # Feedback items are for if we want to ask multiple questions as part of this link.
    prompts = db.relationship("Prompt", back_populates="link")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    # A one-to-many relationship between a link and its actions
    # Action items are updating variables, making notebook entries, or making log entries
    actions = db.relationship("Action", back_populates="link")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Link %d from %d to %d (%d prompts, %s actions)>" % (int(self.id), int(self.page_src_id), int(self.page_dest_id), int(len(self.prompts)), int(len(self.actions)))


class Prompt(db.Model):
    """ Sometimes we need multiple text input boxes in a given link. These are ordered.
    Each prompt can have a text box for user input"""
    __tablename__ = "prompts"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order = db.Column(db.Integer, default=0)
    # TODO do we want a show variable here? For now, let's go with NO, and we can add it later if needed.

    # An optional prompt that is shown above the textbox/textarea, not displayed if ""
    prompt = db.Column(db.String(300), default="")

    # Should we javascript validate to ensure the text box/area is not empty?
    required = db.Column(db.Boolean(), default=True)

    # Should we put a larger textarea here instead of a single-row textbox?
    text_area = db.Column(db.Boolean(), default=False)

    # The variable name given to the user's submitted text in response to this prompt,
    # used with any logging actions for their eval() calls. Prefixed with "feedback_" so
    # you can't accidentally break the DOM of the displayed page.
    var_name = db.Column(db.String(defines["VARIABLE_NAME_LEN"]), default="")

    # A one-to-many relationship between a link and its prompts
    link_id = db.Column(db.Integer, db.ForeignKey("links.id"))
    link = db.relationship("Link", back_populates="prompts")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Prompt %d \"%s\" -> var \"%s\">" % (int(self.id), self.prompt, self.var_name)

class Action(db.Model):
    """ Either a variable, logging, notebooking, or librarying action. """
    __tablename__ = "linkactions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    ACTION_LOG = 0
    ACTION_NOTE = 1
    ACTION_VAR = 2
    ACTION_LIB = 3
    type = db.Column(db.Integer, default=-1)

    # Since I don't know how to properly handle class inheritance with SQLAlchemy,
    # we are just overloading the generic "action_string" variable.

    # CASE: Variable assignment - Easy peasy, but DO NOT make any assumptions about order of variable evaluation
    # For example, there are no guarantees on the final value of X here:
    # X = 5
    # X = 10
    # Here, we re-use action_string (but we don't eval it right away) to save space in the database
    # We assume that it has a value like "lvalue = stuff over here to eval",
    # split on the = sign, then trim spaces around both sides of both lvalue and rvalue.
    # Then we eval rvalue with the current user's variables, and update user vars with the new value for lvalue.

    # CASE: Add entry to library - Not yet supported! TODO
    # Here, we re-use action_string (but we don't eval it) to save space in the database
    # We just append the string value into the library. Not sure if we need to eval it.

    # CASE: Log entry
    # CASE: Notebook entry
    # For log and notebook entries, we sometimes want to use the user's text from the prompts
    # as part of the log or notebook entry. To do this, the action here specifies a formattable
    # string, that uses the submitted values from the user, which is sketchy. So we should run the user
    # input through some sort of safety-improving function. And write a custom safe_eval() function.
    # Use a string like "Tried hypothesis \"{hypo}\" because \"{justification}\"."

    # The icon to go with the notebook entry, not used for any other action type
    icon = db.Column(db.String(50), default="icon-pencil")

    # This is the general-purpose overloaded string for actions. See notes above for usage.
    action_string = db.Column(db.String(5000), default="")

    # A one-to-many relationship between a link and its actions
    link_id = db.Column(db.Integer, db.ForeignKey("links.id"))
    link = db.relationship("Link", back_populates="actions")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Action %d (type %d) \"%s\">" % (int(self.id), int(self.type), self.action_string)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), default="New User", unique=True)
    last_page = db.Column(db.Integer, db.ForeignKey("pages.id"))

    # sim_id = db.Column(db.Integer, db.ForeignKey("simulations.id"))
    # sim = db.relationship("Simulation", back_populates="users")

    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships
    # A one-to-many relationship between a user and his or her notes/logs/libs
    notes = db.relationship("Note", back_populates="user")
    logs = db.relationship("Log", back_populates="user")
    #libs = db.relationship("Log", back_populates="user")
    # Manually doing  the bidirectional one-to-many / many-to-one linking of relationships
    
    def __repr__(self):
        return "<User %r (%d logs, %d notes)>" % (self.name, len(self.logs), len(self.notes))


class Log(db.Model):
    __tablename__ = "logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp = db.Column(db.DateTime)
    content = db.Column(db.String(defines["MAX_LOG_NOTE_LENGTH"]))

    # A one-to-many relationship between a user and his or her logs
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="logs")
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Log (user %r) %r>" % (self.user.name, self.content)


class Note(db.Model):
    __tablename__ = "notes"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp = db.Column(db.DateTime)
    content = db.Column(db.String(defines["MAX_LOG_NOTE_LENGTH"]))

    # The icon is used like a bullet for the notebook list
    # Good icon choices include icon-pencil, icon-check, icon-search, etc
    icon = db.Column(db.String(20), default="icon-pencil")

    # A one-to-many relationship between a user and his or her notes
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="notes")

    #in order to grab a group
    tag = db.Column(db.String(200))
    # Manually doing the bidirectional one-to-many / many-to-one linking of relationships

    def __repr__(self):
        return "<Note (user %r) %r (%r)>" % (self.user.name, self.content, self.icon)

class Logged_In(db.Model):
    __tablename__ = "logged_in_users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    timestamp = db.Column(db.DateTime)

class Group(db.Model):
    __tablename__ = "groups"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), unique=True)
    # so when users are using the same computer, we'll make a bunch of users and have a special endpoint to update all users.
    # or the client side could keep track of all of the users and send requests for each user.
    shared_computer = db.Column(db.Boolean())

class Group_User_Pivot(db.Model):
    __tablename__ = "group_users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"))

class Sim_User_Pivot(db.Model):
    __tablename__ = "sim_users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    sim_id = db.Column(db.Integer, db.ForeignKey("simulations.id"))

# class Lib(db.Model):
#     """ An entry in the user's library. Only updated by links as the user progresses through the simulation. """
#     # TODO This should really be a many-to-many relationship, since each user has multiple visible library entries and each library entry can have multiple users that have it visible, you know?
#     # TODO Also, what about ordering when we display these? If we can have a global sort, then this separate object idea makes sense, but if we want to have them displayed in the order "discovered" then we should just append it to the user's variable - But then what about max size and dedup? Maybe just search through the user's vars first and don't re-add if it's already there?
#     __tablename__ = "libs"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     timestamp = db.Column(db.DateTime)
#     content = db.Column(db.String(500))
#
#     # A one-to-many relationship between a user and his or her logs
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
#     user = db.relationship("User", back_populates="logs")
#     # Manually doing the bidirectional one-to-many / many-to-one linking of relationships
#
#     def __repr__(self):
#         return "<Log (user %r) %r>" % (self.user.name, self.content)
