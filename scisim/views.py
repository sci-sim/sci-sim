import datetime
from string import strip

from flask import render_template, url_for, redirect, abort, request, session

from scisim import app, db, fix_id, defines, clean_text
from models import *
from evaluator import evaluate_expression

def add_manual_notebook_entry(user, user_note):
    user_note = clean_text(user_note[:(defines["MAX_LOG_NOTE_LENGTH"] - 100)])
    note = "<strong>Added notebook entry:</strong><br /><blockquote>" + user_note + "</blockquote>"
    db.session.add(Note(content=note, timestamp=datetime.datetime.now(), user=user, icon="icon-pencil"))
    db.session.add(Log(content=note, timestamp=datetime.datetime.now(), user=user))
    db.session.commit()


@app.errorhandler(404)
def page_not_found(error):
    return render_template('server_error.html', error=error), 404


@app.errorhandler(500)
def page_error(error):
    db.session.rollback()
    return render_template('server_error.html', error=error), 500


@app.route('/admin/preview')
def preview():
    # build a page to list all the current pages
    sims = Simulation.query.all()
    return render_template('preview.html', sims=sims)



@app.route("/admin/preview/<int:page_id>", methods=['GET', 'POST'])
def preview_view_page(page_id):
    page = Page.query.get(page_id)
    if not page:
        abort(404)

    # We just show each page's sections, regardless, same for links.
    sections = []
    for section in page.sections:
        show = True
        content = section.content
        sections.append({"order": section.order, "show": show, "content": content})

    # Evaluate each outgoing link "show" expression
    links = []
    for link in page.links_outgoing:
        show = True
        links.append({"order": link.order, "show": show, "link": link})

    return render_template("page.html", sim=page.sim, page=page, sections=sections, links=links, user=None, user_vars=None)


@app.route('/', methods=['GET', 'POST'])
def index():
    # If the user is already logged in, redirect them to their current page of the simulation.
    if 'username' in session:
        return redirect(url_for('view_page', page_id=session['current_page_id']))

    login_error = None
    username = None
    sim_id = None
    if request.method == 'POST':
        username = request.form['username']
        sim_id = request.form['sim_id']
        password = request.form['password']
        sim = Simulation.query.filter(Simulation.id == sim_id).first()
        if not sim or not sim.enabled:  # client provided an invalid sim id or the simulation is not enabled
            login_error = "Invalid simulation ID, please try again."
        elif sim.password != password:
            login_error = "Invalid simulation password, please ask the instructor for the correct password and try again."
        elif len(username) < 2:  # client username is too short
            # TODO does this catch blank usernames?
            login_error = "Your username must be at least two characters, please try again."
        elif User.query.filter(User.name == username).count() == 0:
            session['username'] = username
            session['sim_id'] = sim_id
            session['current_page_id'] = sim.first_page_id
            session['variables'] = {"username": username, "sim_id": sim_id}
            u = User(name=username, sim_id=sim_id)
            db.session.add(u)
            db.session.commit()
            db.session.add(Note(content="<strong>Logged into simulation \"%s\"</strong>" % sim.title, timestamp=datetime.datetime.now(), user=u, icon="icon-user"))
            db.session.add(Log(content="Logged into simulation %d (\"%s\")" % (sim.id, sim.title), timestamp=datetime.datetime.now(), user=u))
            db.session.commit()
            return redirect(url_for('view_page', page_id=sim.first_page_id))
        else:
            # not a unique username, try again
            login_error = "That username is already being used. Try using a nickname or adding some letters or numbers to your name."

    simulations = Simulation.query.all()
    return render_template('index.html', login_error=login_error, last_username=username, last_sim_id=sim_id, simulations=simulations)


@app.route('/admin/view_users')
def view_users():
    # This is an administrative page, but isn't yet protected TODO
    sims = Simulation.query.all()
    return render_template('view_users.html', sims=sims)


@app.route('/admin/dump_users')
def dump_users():
    # This is an administrative page, but isn't yet protected TODO
    sims = Simulation.query.all()
    return render_template('dump_users.html', sims=sims)

@app.route('/admin')
def admin_index():
    return render_template('admin.html')


@app.route('/reset')
def reset():
    session.pop('username', None)
    return redirect(url_for('index'))


@app.route('/library', methods=["GET", "POST"])
def library():
    # If there is no session cookie set, redirect to the index login page
    if "username" not in session:
        return redirect(url_for('index'))

    # If this simulation does not have a library, redirect to the index page (and then to the current page)
    sim = Simulation.query.get(session['sim_id'])
    if not sim.show_library:
        return redirect(url_for('index'))

    # Check if there is a user in the database with the username from the session cookie
    user = User.query.filter(User.name == session['username']).all()  # TODO how to handle this
    if len(user) != 1:  # we had a cookie but it didn't match a username
        return redirect(url_for('reset'))
    user = user[0]

    if request.method == 'POST' and "notebook_append" in request.form:
        # We have some post data, which can only come from the notebook
        add_manual_notebook_entry(user, request.form["notebook_append"])
        # To avoid breaking the refresh button, we redirect to the same page but without the POST data
        return redirect(url_for('library'))

    # We don't even need to tell the library page where to send the user,
    # we can just point them at / and it will bounce them to the right place
    return render_template("library.html", sim=sim, user=user)


@app.route("/page/<int:page_id>", methods=['GET', 'POST'])
def view_page(page_id):

    # If there is no session cookie set, redirect to the index login page
    if "username" not in session:
        return redirect(url_for('index'))

    # Check if there is a user in the database with the username from the session cookie
    user = User.query.filter(User.name == session['username']).all()  # TODO how to handle this
    if len(user) != 1:  # we had a cookie but it didn't match a username
        return redirect(url_for('reset'))
    user = user[0]

    page = Page.query.get(page_id)
    if not page:
        abort(404)
    db.session.add(Log(content="Pageload %d (true page ID: %d)" % (page_id, fix_id(page_id)), timestamp=datetime.datetime.now(), user=user))
    db.session.commit()

    # While we do store the user variables dictionary in the session,
    # the user cannot modify them due to the cookie signing included in Flask.
    # Still vulnerable to playback attacks, but come on...
    user_vars = session['variables']

    if request.method == 'POST':
        # We have some post data, which can only come from a link's form, which contains zero or more prompt items
        # OR, it could be a notebook submission
        if "notebook_append" in request.form:
            add_manual_notebook_entry(user, request.form["notebook_append"])
        else:
            # Look up the Link object the user just used to get to this destination page
            #print "request.form:", request.form
            link_id = request.form["link_id"]
            link = Link.query.get(link_id)
            # Double-check that the user followed a valid link to get to this page
            #print "link: '%s', page.links_incoming: '%s'" % (str(link), str(page.links_incoming))
            assert link in page.links_incoming # TODO how do we handle this better?

            # Update the user's current_page_id variable
            session['current_page_id'] = page_id

            # The link could have multiple feedback variables the user may have filled out, load them up here:
            feedback_vars = dict(
               [(key.replace("feedback_", ""), clean_text(request.form[key])) for key in request.form.keys() if key.startswith("feedback_")]
            )
            #print "feedback_vars:", feedback_vars
            # TODO how do we protect ourselves from funky user data in our string formatting below?
            # Does the clean_text() function do sufficiently well?

            # Now, we need to perform the link's actions - More details of each type in models.py
            for action in link.actions:
                #print "Performing action", action

                if action.type == Action.ACTION_LOG:
                    content = action.action_string.format(**feedback_vars) # TODO whoah
                    db.session.add(Log(content=content[:(defines["MAX_LOG_NOTE_LENGTH"])], timestamp=datetime.datetime.now(), user=user))

                elif action.type == Action.ACTION_NOTE:
                    content = action.action_string.format(**feedback_vars) # TODO whoah
                    db.session.add(Note(content=content[:(defines["MAX_LOG_NOTE_LENGTH"])], timestamp=datetime.datetime.now(), user=user, icon=action.icon))

                elif action.type == Action.ACTION_VAR:
                    # Our action_string will be something like "foo = bar + baz * 2", so we split on the "="
                    #print action.action_string
                    lhs, rhs = map(strip, action.action_string.split("="))
                    #print "lhs: '%s', rhs: '%s'" % (lhs, rhs)
                    # Now, we need to evaluate the rhs to find the value to assign to lhs
                    eval_vars = dict(user_vars.items() + feedback_vars.items())
                    rvalue = evaluate_expression(rhs, eval_vars)
                    #print "rvalue:", rvalue
                    user_vars[lhs] = rvalue

                elif action.type == Action.ACTION_LIB:
                    print "Library action types are not yet supported, sorry..."

                else:
                    print "Found an action with unrecognized type %d, as part of link %d" % link_id
                    #abort(500)

        # Commit any database objects we created or updated
        db.session.commit()

        # To avoid breaking the refresh button, we redirect to the same page but without the POST data
        return redirect(url_for('view_page', page_id=page_id))
    # else # if request.method == "POST"

    # evaluate each page section "show" and "content" expressions
    sections = []
    for section in page.sections:
        show = evaluate_expression(section.show, user_vars)
        content = section.content.format(**user_vars)
        #print section, section.show, show
        sections.append({"order": section.order, "show": show, "content": content})

    # Evaluate each outgoing link "show" expression
    links = []
    for link in page.links_outgoing:
        show = evaluate_expression(link.show, user_vars)
        #print link, link.show, show
        links.append({"order": link.order, "show": show, "link": link})

    sim = Simulation.query.get(session['sim_id'])

    return render_template("page.html", sim=sim, page=page, sections=sections, links=links, user=user, user_vars=user_vars)

