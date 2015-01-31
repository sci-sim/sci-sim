### users
- user (string)
- pass (string)

### pages
- title (string)
- description (string)
- order (integer, to track when to put each simulation)
- sim_id (integer, references simulations table)

### simulations
- ~~first_page_id~~ (we just put an order variable on each page instead)

### sections
- title (string)
- description (string, to give info for admin side) ** 
- content (strong)
- show (boolean)
- page_id (integer, references pages table)

### prompts
- order (integer)
- prompt (string)
- title (string)
- description (string)
- required (boolean)
- field_type (string)
- ~~text_area~~ (can use a field type instead to broaden the question types)
- var_name (string)
- link_id (integer, references links tables)

### notes
- sim_id (integer, references simulations table, added so that we can know which simulation the user made te note in. That's important right?)

### simulations_users (to track which simulations the user does and which users do which simulations)
- user_id 
- sim_id

### prompts_users (to track the answers the user gives to the prompts)
- prompt_id
- user_id
- answer (string)

#### pages_users (to track which pages users go by and when)
- user_id
- page_id
- transition_count (integer, everytime a user visits a page, this is auto-incemented.)
