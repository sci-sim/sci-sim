import os
from random import randrange
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext import htauth


defines = {
    "MAX_LOG_NOTE_LENGTH": 2000,
    "VARIABLE_NAME_LEN": 50,
    "EVAL_STRING_LEN": 1000,
}

def clean_text(t):
    """ Cleans up text from the user, converts spaces to &nbsp; and the various newline strings \r and \n and combinations thereof to <br />, and converts &, <, and > to their entity forms. """
    br = "<br />"
    # Oops, have to escape the & < > first, otherwise we mess up our br and nbsp...
    # TODO right now long strings of spaces are collapsed by the browser.
    # We could replace them by &nbsp but we want to leave one normal space to have paragraph breaking still work.
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('\r\n', br).replace('\n\r', br).replace('\r', br).replace('\n', br)

theid = 0
def next_id():
    global theid
    theid += 1
    return theid * 100
def new_next_id():
   """ To keep people from trying to skip ahead by manually adjusting the location bar,
   we keep a globally incrementing page id, and then multiply by 100 and add some random digits
   to make them random looking. """
   global theid
   theid += 1
   return theid * 100 + randrange(10, 99)
def fix_id(my_id):
   """ Strips away the random digits and returns just the true proper page ID. """
   return my_id / 100 # NOTE This needs to be integer division, so watch out if we ever use python 3!

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__, static_folder=os.path.join(PROJECT_ROOT, '../scisim/static'), static_url_path='/static')
app.debug = True # TODO change this for dev

app.config['BOOTSTRAP_FONTAWESOME'] = True
app.config['BOOTSTRAP_JQUERY_VERSION'] = "1.7.1"

app.secret_key = r'\x1f|\xbd\xd5\x91r~\x81\xaf;\xdc\xc0\x97\t\xaeh\xca\x8c\tD3\xd5\xdfq\x9eo\xe7\xac\x97f\xc5I'

if 'DATABASE_URL' in os.environ:
    app.config['HEROKU'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
else:
    app.config['HEROKU'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + os.path.join(PROJECT_ROOT, "../app.db")

db = SQLAlchemy(app)

from scisim import views, models

