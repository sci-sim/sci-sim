from scisim import app, db, clean_text
from flask import request, Response
from scisim.models import *
from scisim.helpers import *
from sqlalchemy import and_
from datetime import datetime
from json import dumps
import datetime
import sim_parser

@app.route('/api/users/create', methods=["POST"])
def api_users_create():
    error = check_for_params(['username', 'sim_id'], request)
    if error:
        return error_message(error)

    username = request.form['username']

    if len(username) < 1:
        return error_message('The username must have more than 1 character')

    user = User(name=username)
    db.session.add(user)

    try:
        db.session.commit()
    except Exception:
        return error_message("This user has already been created. If you previously got the 'simulation does not exist' error using this route, then please use the /api/simulations/add_user endpount.")

    sim = Simulation.query.filter(Simulation.id == request.form['sim_id']).first()
    if not sim:
        return error_message("That simulation does not exist.")

    sim_user_pivot = Sim_User_Pivot(user_id=user.id, sim_id=sim.id)
    db.session.add(sim_user_pivot)

    logged_in = Logged_In(user_id=user.id, timestamp=datetime.datetime.now())
    db.session.add(logged_in)

    db.session.commit()
        
    return respond_json(dumps(unpack_model(user)))

@app.route('/api/users/login', methods=["POST"])
def api_users_login():
    error = check_for_params(["username"], request)
    if error:
        return error_message(error)
    username = request.form['username']
    user = User.query.filter(User.name == username).first()
    if not user:
        return error_message("User with username " + username + " was not found")

    user_id = user.id
    userLoggingIn = Logged_In(user_id = user_id, timestamp=datetime.datetime.now())
    db.session.add(userLoggingIn)
    db.session.commit()

    return success_message("User successfully logged in.")

@app.route('/api/users/update_session', methods=["POST"])
def api_users_update_session():
    error = check_for_params(["username", "new_page_id"], request)
    if error:
        return error_message(error)

    username = request.form['username']
    new_page_id = request.form['new_page_id']

    update_user_session(new_page_id, username=username)

    return success_message("Last page updated successfully")

@app.route('/api/users/last_session', methods=["POST"])
def api_users_last_session():
    error = check_for_params(["username"], request)
    if error:
        return error_message(error)

    username = request.form["username"]

    user = User.query.filter(User.name == username).first()
    if not user:
        return error_message("User with username " + username + " was not found")
        
    sim_id = Sim_User_Pivot.query.filter(Sim_User_Pivot.user_id == user.id).first()
    
    return respond_json(dumps({"page": user.last_page, "sim_id": sim_id.sim_id}))

@app.route('/api/users/notes', methods=['POST'])
def api_users_notes():
    error = check_for_params(['user_id'], request)
    if error:
        return error_message(error)

    return to_json(Note.query.filter(Note.user_id == request.form['user_id']))

@app.route('/api/users/log', methods=["POST"])
def api_users_continue():
    #TODO: we need to make it so that the user's actions are recorded in the lab notebook - crate a place where actions are stored AND notes are made
    error = check_for_params(['user_id', 'page_id', 'action_string'], request)
    if error:
        return error_message(error)
    user_id = request.form['user_id']
    page_id = request.form['page_id']
    action_string = request.form['action_string']

    log = Log(timestamp=datetime.datetime.now(), content=action_string, user_id=user_id)
    # Assume that this page is the last page that the user was on
    update_user_session(page_id, user_id=user_id)

    return success_message("Logged the user's action")

@app.route('/api/users/logout', methods=["POST"])
def api_users_logout():
    error = check_for_params(["username"], request)
    if error:
        return error_message(error)
    username = request.form['username']
    user = User.query.filter(User.name == username).first()

    if not user:
        return error_message("User with username " + username + " was not found")

    loggedInUser = Logged_In.query.filter(Logged_In.user_id == user.id).first()
    if not loggedInUser:
        return error_message("User " + user.name + " was not logged in.")

    db.session.delete(loggedInUser)
    db.session.commit()

    return success_message("User was logged out successfully")

@app.route('/api/groups/create', methods=["POST"])
def api_groups_create():
    error = check_for_params(['group_name', 'shared_computer'], request)
    if error:
        return error_message(error)
    group_name = request.form['group_name']
    shared = request.form['shared_computer']
    if shared not in ["0", "1", 0, 1]:
        return error_message("The shared_computer parameter must be an interger of 0 or 1")

    shared = int(shared)
    group = Group(name=group_name, shared_computer=shared)
    db.session.add(group)
    try:
        db.session.commit()
    except Exception:
        return error_message("The group name was not unique.")

    return success_message("Group successfully added")

@app.route('/api/groups/add_user', methods=['POST'])
def api_groups_add_user():
    error = check_for_params(['username', 'group_name'], request)
    if error:
        return error_message

    username = request.form['username']
    group_name = request.form['group_name']

    user = User.query.filter(User.name == username).first()
    if not user:
        return error_message("User does not exist")

    group = Group.query.filter(Group.name == group_name).first()
    if not group:
        return error_message("Group does not exist")

    pivot = Group_User_Pivot(user_id=user.id, group_id=group.id)
    db.session.add(pivot)
    db.session.commit()

    return success_message("User successfully added to the group")

@app.route('/api/simulations/create', methods=['POST'])
def api_simulations_create():
    error = check_for_params(['contents'], request)
    if error:
        return error_message(error)

    sim = request.form['contents']
    
    errors = sim_parser.parse_sim(sim)
    if errors:
        return dumps({"errors":errors})

    medias = sim_parser.get_all_media(sim)
    return dumps({"medias":medias})

@app.route('/api/simulations/all', methods=['GET'])
def api_simulations_all():
    return to_json(Simulation.query.all())

@app.route('/api/simulations/add_user', methods=['POST'])
def api_simulation_add_user():
    error = check_for_params(['username', 'sim_id'], request)
    if error:
        return error_message(error)

    username = request.form['username']
    sim_id = request.form['sim_id']

    user = User.query.filter(User.name == username).first()
    if not user:
        return error_message("User does not exist.")

    sim = Simulation.query.filter(Simulation.id == sim_id).first()
    if not sim:
        return error_message("Simlation does not exist.")

    sim_user_pivot = Sim_User_Pivot(sim_id=sim.id, user_id=user.id)

    db.session.add(sim_user_pivot)
    db.session.commit()

    return success_message("User successfully added to simulation.")

@app.route('/api/simulations/pages', methods=['POST'])
def api_simulations_pages():
    error = check_for_params(['sim_id'], request)
    if error:
        return error_message(error)

    return to_json(Page.query.filter(Page.sim_id == request.form['sim_id']))

@app.route('/api/simulations/check_password', methods=['POST'])
def api_simulations_check_password():
    error = check_for_params(['sim_id', 'password'], request)
    if error:
        return error_message(error)

    sim_id = request.form['sim_id']
    password = request.form['password']

    simulation = Simulation.query.filter(Simulation.id == sim_id).first()

    if not simulation:
        return error_message("Simulation not found")

    if simulation.password == password:
        return success_message("passwords match")
    else:
        return error_message("password does not match")

# not sure how useful this would be
@app.route('/api/page', methods=['POST'])
def api_page():
    error = check_for_params(['page_id'], request)
    if error:
        return error_message(error)
    return to_json(Page.query.filter(Page.id == request.form['page_id']).all())

@app.route('/api/pages/links', methods=['POST'])
def api_pages_links():
    error = check_for_params(['page_id'], request)
    if error:
        return error_message(error)

    return to_json(Link.query.filter(Link.page_src_id == request.form['page_id']))

@app.route('/api/pages/sections', methods=['POST'])
def api_pages_sections():
    error = check_for_params(['page_id'], request)
    if error:
        return error_message(error)

    return to_json(Section.query.filter(Section.page_id == request.form['page_id']))

@app.route('/api/links/prompts', methods=['POST'])
def api_links_prompts():
    error = check_for_params(['link_id'], request)
    if error:
        return error_message(error)

    return to_json(Prompt.query.filter(Prompt.link_id == request.form['link_id']))


@app.route('/api/notes/create', methods=['POST'])
def api_notes_create():
    error = check_for_params(['user_id', 'note'], request)
    if error:
        return error_message(error)

    user = User.query.filter(User.id == request.form['user_id']).first()
    user_note = clean_text(request.form['note'])

    note = "<strong>Added notebook entry:</strong><br /><blockquote>" + user_note + "</blockquote>"

    n = Note(content=user_note, timestamp=datetime.now(), user=user, icon="icon-pencil")
    db.session.add(n)
    db.session.add(Log(content=note, timestamp=datetime.now(), user=user))
    db.session.commit()

    return dumps(unpack_model(n))

@app.route('/api/note/destroy', methods=['POST'])
def api_notes_destroy():
    error = check_for_params(['note_id'], request)
    if error:
        return error_message(error)

    note = Note.query.filter(Note.id == request.form['note_id']).first()
    db.session.delete(note)
    db.session.commit()

    return success_message('Note destroyed')

@app.route('/api/models/update', methods=['PUT'])
def api_update():
	error = check_for_params(['id', 'model'], request)
	if error:
		return error_message(error)
	
	action = doModelAction("update", request.form['model'].title())
	
	if type(action) is Response:
		return action
	
	return success_message("record updated successfully")

@app.route('/api/models/create', methods=['POST'])
def api_create():
	error = check_for_params(['model'], request)
	if error:
		return error_message(error)
	
	action = doModelAction("create", request.form['model'].title())
	
	if type(action) is Response:
		return action
	
	return respond_object(unpack_model(action))

@app.route('/api/models/delete', methods=['POST'])
def api_delete():
	error = check_for_params(['model'], request)
	if error:
		return error_message(error)
	
	action = doModelAction("delete", request.form['model'].title())
	
	if type(action) is Response:
		return action
	
	return success_message("Deleted Success")
	
	
@app.route('/api/media/upload', methods=['POST'])
def api_media_upload():
    file = request.files['file']
    # This is going to need to be replaced on the server.
    file.save('/vagrant/app/scisim/media/' + file.filename)

    return success_message("File uploaded")
	
def fillModel(model, value_dict):
	model_keys = model.__table__.columns._data.keys()
	for title,value in value_dict.iteritems():	
		if(title in model_keys):
			setattr(model, title, value)

get_class = lambda x: globals()[x]

def doModelAction(action, model):
	try:
		model = get_class(request.form['model'].title())
	except KeyError, e:
		return error_message("Model not found")
	
	if not model:
		return error_message("This object does not exist.")
	if type(model) is not type(db.Model):
		return error_message("The object you supplied is not a model.")
	
	values = request.values.copy()
	
	if action == "update":
		model_obj = model.query.filter(model.id == values['id']).first()
		if not model_obj:
			return error_message("model with id: " + values['id'] + " does not exist")
			
	elif action == "create":
		model_obj = model()
	
	elif action == "delete":
		model_obj = model.query.filter(model.id == values['id']).first()
		db.session.delete(model_obj)
		db.session.commit()
		return True
	
	fillModel(model_obj, values.to_dict())
	
	db.session.add(model_obj)
	db.session.commit()

	return model_obj