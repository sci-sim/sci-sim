from scisim import app, db, clean_text
from flask import request
from models import *
from scisim.helpers import *
from sqlalchemy import and_
from datetime import datetime
from json import dumps
import datetime

@app.route('/api/register', methods=["POST"])
def api_register():
    username = request.form['username']
    sim_id = request.form['sim_id']
    password = request.form['password']

    if len(username) < 1:
        return error_message('The username must have more than 1 character')

    sim = Simulation.query.filter(Simulation.id == sim_id).first()
    if sim.password != password:
        return error_message('The simulation password is not correct')

    user = User(name=username, sim_id=sim_id)

    db.session.add(user)
    db.session.commit()

    loggedIn = Logged_In(user_id=user.id, timestamp=datetime.datetime.now())

    db.session.add(loggedIn)
    db.session.commit()

    return dumps(unpack_model(user))

@app.route('/api/login', methods=["POST"])
def api_login():
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

@app.route('/api/update_session', methods=["POST"])
def api_update_session():
    error = check_for_params(["username", "page_id"], request)
    if error:
        return error_message(error)

    username = request.form['username']
    page_id = request.form['page_id']

    user = User.query.filter(User.name == username).first()
    if not user:
        return error_message("User with username " + username + " was not found")

    page = Page.query.filter(Page.id == page_id).first()
    if not page:
        return error_message("Page with id " + page_id + " was not found")

    user.last_page = page.id

    db.session.commit()

    return success_message("Last page updated successfully")

@app.route('/api/last_session', methods=["POST"])
def api_last_session():
    error = check_for_params(["username"], request)
    if error:
        return error_message(error)

    username = request.form["username"]

    user = User.query.filter(User.name == username).first()
    if not user:
        return error_message("User with username " + username + " was not found")

    return dumps({"page": user.last_page})


@app.route('/api/logout', methods=["POST"])
def api_logout():
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

    return success_message("User logged out successfully")

@app.route('/api/simulations', methods=['GET'])
def api_simulations():
    return to_json(Simulation.query.all())

@app.route('/api/pages', methods=['POST'])
def api_pages():
    error = check_for_params(['sim_id'], request)
    if error:
        return error_message(error)

    return to_json(Page.query.filter(Page.sim_id == request.form['sim_id']))

@app.route('/api/page', methods=['POST'])
def api_page():
    error = check_for_params(['page_id'], request)
    if error:
        return error_message(error)
    return to_json(Page.query.filter(Page.id == request.form['page_id']))


@app.route('/api/links', methods=['POST'])
def api_links():
    error = check_for_params(['page_id'], request)
    if error:
        return error_message(error)

    return to_json(Link.query.filter(Link.page_src_id == request.form['page_id']))

@app.route('/api/sections', methods=['POST'])
def api_sections():
    error = check_for_params(['page_id'], request)
    if error:
        return error_message(error)

    return to_json(Section.query.filter(Section.page_id == request.form['page_id']))

@app.route('/api/prompts', methods=['POST'])
def api_section():
    error = check_for_params(['link_id'], request)
    if error:
        return error_message(error)

    return to_json(Prompt.query.filter(Prompt.link_id == request.form['link_id']))


@app.route('/api/notes', methods=['POST'])
def api_notes():
    error = check_for_params(['user_id'], request)
    if error:
        return error_message(error)

    return to_json(Note.query.filter(Note.user_id == request.form['user_id']))

@app.route('/api/note/create', methods=['POST'])
def api_create_note():
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
def api_destroy_note():
    error = check_for_params(['note_id'], request)
    if error:
        return error_message(error)

    note = Note.query.filter(Note.id == request.form['note_id']).first()
    db.session.delete(note)
    db.session.commit()

    return success_message('Note destroyed')
