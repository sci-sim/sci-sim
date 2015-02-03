### User
- id (integer, primary key)
- name (string, the username)
- pass (string, the password entered by the user or set by an admin)
- notes (auto list of the user notes)
- logs (auto list of the user logs)
- sim_id (integer, foreign key to the simulation this user selected)
- sim (auto reference to the Simulation object)

### Pages
- id (integer, primary key)
- title (string, used in an h1 at the top of the page)
- sim_id (integer, foreign key to simulations table)
- sim (auto reference to Simulation object this page belongs to)
- sections (auto list of sections in this page)
- links_outgoing (auto list of outgoing Link objects)
- links_incoming (auto list of incoming Link objects)

### Simulation
- id (integer, primary key)
- basename (string, name of directory for image storage, must be valid dir name)
- title (string, used for "pick a simulation" page)
- desc (string, used for "pick a simulation" page)
- preview_img (string, used with basename, used for "pick a simulation" page)
- preview_img_credit (string, used for "pick a simulation" page)
- first_page_id (integer, indicates first page in simulation)
- order (integer, sorts simulations on "pick a simulation" page)
- enabled (boolean, if true display sim on "pick a simulation" page)
- password (string, used to grant entry to simulation)
- show_library (boolean, if true display link to library during sim)
- library (string, very long, the html for the library page contents)
- pages (auto list of pages in the simulation)
- users (auto list of users who have done this simulation)

### Section
- id (integer, primary key)
- order (integer, used to sort sections on page)
- show (boolean, evaluated with user vars to determine visibility)
- content (string, html content of section)
- page_id (integer, foreign key to pages table)
- page (auto reference to Page object this section belongs to)

### Link
- id (integer, primary key)
- order (integer, used to sort links on page)
- show (boolean, evaluated with user vars to determine visibility)
- button_text (string, text for button)
- top_text (string, used for header text at top of link if you want)
- show_well (boolean, whether or not to put link in well and number it)
- page_src_id (integer, foreign key to pages table)
- page_src (auto refernce to source Page object)
- page_dest_id (integer, foreign key to pages table)
- page_dest (auto reference to destination Page object)
- prompts (auto list of Prompt objects for this Link)
- actions (auto list of Action objects for this Link)

### Prompt
- id (integer, primary key)
- order (integer, used to sort prompts in link)
- prompt (string, optional prompt above textbox/textarea)
- required (boolean, if the javascript should force user to enter something)
- text_area (boolean, true = use text area instead of single-row textbox)
- var_name (string, name for captured user input, usable in actions)
- link_id (integer, foreign key to links table)
- link (auto reference to Link object that owns this prompt)

### Action
- id (integer, primary key)
- type (integer, ACTION_LOG/ACTION_NOTE/ACTION_VAR/ACTION_LIB enum)
- icon (string, only used for ACTION_NOTE to store bullet point type)
- action_string (string, usage based on type)
- link_id (integer, foreign key to links table)
- link (auto reference to Link object that owns this prompt)

### Log
- id (integer, primary_key)
- timestamp (DateTime, records when the log entry was created)
- content (string, the log entry itself)
- user_id (integer, foreign key to user table)
- user (auto reference to the User object that owns this Log)

### Note
- id (integer, primary_key)
- timestamp (DateTime, records when the notebook entry was created)
- content (string, the notebook entry itself)
- user_id (integer, foreign key to user table)
- user (auto reference to the User object that owns this Log)
- icon (string, the icon to use for the bullet point in the notebook)
