# API Documentation

> Note: all endpoints return JSON

### /api/login
*method:* **POST**  
*parameters:* **username**, **sim_id**, **password**  
*description:* creates a user entry in the database and compares the entered password with the simulation password
*onsuccess returns:* the user model  

### /api/simulations
*method:* **GET**  
*parameters:* **none**  
*description:* fetches all the simulations
*onsuccess returns:* list of simulations in the database  

### /api/pages  
*method:* **POST**  
*parameters:* **sim_id**  
*description:* fetches the pages of the simulation
*onsuccess returns:* list of pages associated with the simulation  

### /api/links  
*method:* **POST**  
*parameters:* **page_id**  
*description:* fetches the links on the page
*onsuccess returns:* list of links associated with the page  

### /api/sections  
*method:* **POST**  
*parameters:* **page_id**  
*description:*  fetches the sections of the page
*onsuccess returns:* list of sections associated with the page  

### /api/prompts  
*method:* **POST**  
*parameters:* **link_id**  
*description:* fetches the prompts that go with the link
*onsuccess returns:* list of prompts associated with the link  

### /api/notes  
*method:* **POST**  
*parameters:* **user_id**  
*description:* fetches the notes of the user  
*onsuccess returns:* list of notes associated with the user  

### /api/note/create  
*method:* **POST**  
*parameters:* **user_id**, **note**  
*description:* creates a note entry in the database  
*onsuccess returns:* the note model  

### /api/note/destroy  
*method:* **POST**  
*parameters:* **note_id**  
*description:* removes the note with the ID from the database  
*onsuccess returns:* success message  
