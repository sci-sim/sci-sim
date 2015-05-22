from json import dumps
from datetime import datetime
from flask import Response
from scisim import app
from scisim.models import *

def unpack_model(model):
    # iterate over the models to make the output: ['model': {'key': 'value'}]
    modelDict = {}
    relationTable = model.__table__.name
    columns = model.__table__.columns._data.keys()

    for c in columns:
        # convert timestamp object to an actual timestamp
        if c == "timestamp":
            attr = (getattr(model, c) - datetime(1970,1,1)).total_seconds()
        else:
            attr = getattr(model, c)
        modelDict[c] = attr

    return modelDict

def serialize(query):
    # we wantto transform a sqlalchemy query set into something that can be turned into json
    serialized = []
    for result in query:
        # Strategy: get all the columns on the model and put them in a dictionary.
        # Then get the relation models and do the same thing, adding them to the master dictionary
        s = {}
        relations = result.__mapper__.relationships._data.keys()
        columns = result.__table__.columns._data.keys()
        table = result.__table__.name

        for c in columns:
            if c == "timestamp":
                # convert timestamp object to an actual timestamp
                attr = (getattr(result, c) - datetime(1970,1,1)).total_seconds()
            else:
                attr = getattr(result, c)

            s[c] =  attr

        if(relations):
            for relation in relations:
                s[relation] = []
                relationModels = []
                relationModels.append(getattr(result, relation))

                if len(relationModels) == 1:
                    try:
                        # we're going to check if there's only 1 item, and then if there is we're
                        # going to check if that object is an object. if it's not, then it's a list
                        # and we don't need lists inside of lists.
                        len(relationModels[0])
                        relationModels = relationModels[0]
                    except TypeError:
                        pass

                for model in relationModels:
                    modelDict = unpack_model(model)
                    s[relation].append(modelDict)

        serialized.append(s)
    if len(serialized) == 1:
        return serialized[0]
        
    return serialized


def respond_json(data):
    return Response(data, status=200, mimetype='application/json')

def to_json(query):
    return respond_json(dumps(serialize(query)))

def error_message(message):
    return respond_json(dumps({"error": message}))

def success_message(message = "Success!"):
    return respond_json(dumps({"success":message}))

def check_for_params(params, request):
    # TODO: check yet if we NEED the request object passed in or not
    missing_params = []
    for param in params:
        if param not in request.form:
            missing_params.append(param)

    if not missing_params:
        return None

    error_string = "Missing Parameters: "
    if missing_params:
        for param in missing_params:
            error_string += param + " "

    return error_string

def update_user_session(new_page_id, username=None, user_id=None):
    if user_id:
        user = User.query.filter(User.id == user_id)
    elif username:
        user = User.query.filter(User.name == username).first()
        
    if not user:
        return error_message("User with username " + username + " was not found")

    page = Page.query.filter(Page.id == new_page_id).first()
    if not page:
        return error_message("Page with id " + new_page_id + " was not found")

    user.last_page = page.id

    db.session.commit()