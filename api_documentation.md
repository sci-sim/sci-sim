# API Documentation

> Note: all endpoints return JSON  

### /api/register  
*method:* **POST**  
*parameters:* **username**, **sim_id**, **password**  
*description:* creates a user entry in the database and compares the entered password with the simulation password  
*onsuccess returns:* the user model  
*return type:* an object

### /api/login  
*method:* **POST**  
*parameters:* **username**
*description:* logs the user into the database. A cron job will be set up to log people out each midnight  
*onsuccess returns:* success message
*return type:* success object

### /api/update_session  
*method:* **POST**  
*parameters:* **username**, **page_id**  
*description:* updates the page that the user was last on  
*onsuccess returns:* success message  
*return type:* success object  

### /api/last_session  
*method:* **POST**  
*parameters:* **username**  
*description:* fetches the last page that the user was on  
*onsuccess returns:* the last page the user was on  
*return type:* an object  

### /api/logout  
*method:* **POST**  
*parameters:* **username**  
*description:* takes the user out of the logged in table  
*onsuccess returns:* success message  
*return type:* success object  

### /api/simulations  
*method:* **GET**  
*parameters:* **none**  
*description:* fetches all the simulations  
*onsuccess returns:* list of simulations in the database
*return type:* an array of objects  

### /api/pages  
*method:* **POST**  
*parameters:* **sim_id**  
*description:* fetches the pages of the simulation  
*onsuccess returns:* pages associated with the simulation  
*return type:* an array of objects  

### /api/links  
*method:* **POST**  
*parameters:* **page_id**  
*description:* fetches the links on the page  
*onsuccess returns:* list of links associated with the page  
*return type:* an array of objects  

### /api/sections  
*method:* **POST**  
*parameters:* **page_id**  
*description:*  fetches the sections of the page  
*onsuccess returns:* list of sections associated with the page  
*return type:* an array of objects  

### /api/prompts  
*method:* **POST**  
*parameters:* **link_id**  
*description:* fetches the prompts that go with the link  
*onsuccess returns:* list of prompts associated with the link  
*return type:* an array of objects  

### /api/notes  
*method:* **POST**  
*parameters:* **user_id**  
*description:* fetches the notes of the user  
*onsuccess returns:* list of notes associated with the user  
*return type:* an array of objects  

### /api/note/create  
*method:* **POST**  
*parameters:* **user_id**, **note**  
*description:* creates a note entry in the database  
*onsuccess returns:* the note model  
*return type:* an object  

### /api/note/destroy  
*method:* **POST**  
*parameters:* **note_id**  
*description:* removes the note with the ID from the database  
*onsuccess returns:* success message  
*return type:* success object  
