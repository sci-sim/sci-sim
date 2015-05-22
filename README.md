SCI-SIMS
========

Science Classroom Inquiry Simulation engine

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
