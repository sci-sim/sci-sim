SCI-SIMS
========

Science Classroom Inquiry Simulation engine

Local Development
=================
**Note that this is a python2.7 application**


Virtualenv is great for python development. Create a new environment:

```
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```
Or you can spin up a vagrant box using [this tool](https://github.com/calebdre/Portable-Vagrant.git)  if you don't already have a python environment set up on your system.  
Note that the python server does not serve static assesets - a web server should be used to proxy requests to the server and server static files from the static folder.

Load the database with the simulation content:

    python db_create.py
    python sim_parser new_sim_template.txt

Start the application locally:

    python start_local_dev.py

Open the simulation in your browser @ [localhost:5000](http://localhost:5000)
