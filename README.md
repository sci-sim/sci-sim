SCI-SIMS
========

Science Classroom Inquiry Simulation engine

## NOTES (from latest commit)
- I added a new table/model, so db_create will have to be run again.
- The way we track logged in users is through a table. most of the logging in will be tracked through the database - there is a table of logged in users. We need to set a cron job logging out people who have been in for more than a day
- Interrupted sessions are also solved: the last page a user visited is stored on the user model/table 

TODO items
==========
* Add license info to all the source files

Deploying to Heroku
===================
todo

Local Development
=================
Virtualenv is great for python development. Create a new environment:

```
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```

Load the database with the simulation content:

    python db_create.py

Start the application locally:

    python start_local_dev.py

Open the simulation in your browser.
