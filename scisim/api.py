from scisim import app, db, clean_text
from flask import request
from models import *
from scisim.helpers import *
from sqlalchemy import and_
from datetime import datetime
from json import dumps

@app.route('/api/login')
def login():
    username = request.form['username']
    sim_id = request.form['sim_id']
    password = request.form['password']

    if len(username) < 1:
        return error_message('The username must have more than 1 character')

    sim = Simulation.query.filter(Simulation.id == sim_id).first()
    if sim.password != password:
        return error_message('The simulation password is not correct')

    user = User(name=username, sim_id=sim_id)
    db.add(user)
    db.commit()

    return dumps(unpack_model(user))


@app.route('/api/logout')
def logout():
    # maybe we could create a 'logged in' table that will store logged in users. Put an expiration and remove logged in users with a cron job
    pass

@app.route('/api/simulations', methods=['GET'])
def simulations():
    return to_json(Simulation.query.all())

@app.route('/api/pages', methods=['POST'])
def pages():
    check = check_for_params(['sim_id'], request)
    if type(check) is type(str()):
        return error_message(check)

    return to_json(Page.query.filter(Page.sim_id == request.form['sim_id']))

@app.route('/api/page', methods=['POST'])
def page():
    check = check_for_params(['page_id'], request)
    if type(check) is type(str()):
        return error_message(check)
    return to_json(Page.query.filter(Page.id == request.form['page_id']))


@app.route('/api/links', methods=['POST'])
def links():
    check = check_for_params(['page_id'], request)
    if type(check) is type(str()):
        return error_message(check)

    return to_json(Link.query.filter(Link.page_src_id == request.form['page_id']))

@app.route('/api/sections', methods=['POST'])
def sections():
    check = check_for_params(['page_id'], request)
    if type(check) is type(str()):
        return error_message(check)

    return to_json(Section.query.filter(Section.page_id == request.form['page_id']))

@app.route('/api/prompts', methods=['POST'])
def section():
    check = check_for_params(['link_id'], request)
    if type(check) is type(str()):
        return error_message(check)

    return to_json(Prompt.query.filter(Prompt.link_id == request.form['link_id']))


@app.route('/api/notes', methods=['POST'])
def notes():
    check = check_for_params(['user_id'], request)
    if type(check) is type(str()):
        return error_message(check)

    return to_json(Note.query.filter(Note.user_id == request.form['user_id']))

@app.route('/api/note/create', methods=['POST'])
def create_note():
    check = check_for_params(['user_id', 'note'], request)
    if type(check) is type(str()):
        return error_message(check)

    user = User.query.filter(User.id == request.form['user_id']).first()
    user_note = clean_text(request.form['note'])

    note = "<strong>Added notebook entry:</strong><br /><blockquote>" + user_note + "</blockquote>"

    n = Note(content=note, timestamp=datetime.now(), user=user, icon="icon-pencil")
    db.session.add(n)
    db.session.add(Log(content=note, timestamp=datetime.now(), user=user))
    db.session.commit()

    return dumps(unpack_model(n))

@app.route('/api/note/destroy', methods=['POST'])
def destroy_note():
    check = check_for_params(['note_id'], request)
    if type(check) is type(str()):
        return error_message(check)

    note = Note.query.filter(Note.id == request.form['note_id']).first()
    db.session.delete(note)
    db.session.commit()

    return success_message('Note destroyed')
