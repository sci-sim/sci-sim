# API Documentation

> Note: all endpoints return JSON  

Users
----
#### /api/users/create
*method:* **POST**  
*parameters:* **username**  
*Optional parameters:* **sim__id**  
*description:* creates a user in the database and logs them in.
If sim_id is passed, it adds the user to the simulation. The username must be unique.  
*onsuccess returns:* the user model  

#### /api/users/login  
*method:* **POST**  
*parameters:* **username**  
*description:* logs the user into the database. A cron job will be set up to log people out each midnight  
*onsuccess returns:* success message  

#### /api/users/update_session  
*method:* **POST**  
*parameters:* **username**, **page_id**  
*description:* updates the page that the user was last on  
*onsuccess returns:* success message  

#### /api/users/last_session  
*method:* **POST**  
*parameters:* **username**  
*description:* fetches the last page that the user was on  
*onsuccess returns:* the last page the user was on  

#### /api/users/logout  
*method:* **POST**  
*parameters:* **username**  
*description:* takes the user out of the logged in table  
*onsuccess returns:* success message  

#### /api/users/notes  
*method:* **POST**  
*parameters:* **user_id**  
*description:* fetches the notes of the user  
*onsuccess returns:* list of notes associated with the user  

Groups  
----
#### /api/groups/create  
*method:* **POST**  
*parameters:* **group_name**, **shared_computer**  
*description:* Creates an entry in the database denoting the group name and if the group is using a shared computer. The group name must be unique.  
*onsuccess returns:*  success message  

#### api/groups/add_user  
*method:* **POST**  
*parameters:* **group_name**, **username**  
*description:* Adds a user to a group  
*onsuccess returns:*  success message  

Simulations  
----
#### /api/simulations/all  
*method:* **GET**  
*parameters:* **none**  
*description:* fetches all the simulations  
*onsuccess returns:* list of simulations in the database  

#### api/simulations/pages  
*method:* **POST**  
*parameters:* **sim_id**  
*description:* Fetches all the pages of a simulation  
*onsuccess returns:*  an array of objects representing each page  

#### /api/simulations/add_user  
*method:* **POST**  
*parameters:* **sim_id**, **username**  
*description:* Adds a user to a simulation  
*onsuccess returns:*  success message

#### api/simulations/check_password  
*method:* **POST**  
*parameters:* **sim_id**, **password**  
*description:* checks the given password against the simulation password  
*onsuccess returns:*  success message  

Pages  
----
#### /api/page  
*method:* **POST**  
*parameters:* **sim_id**  
*description:* fetches the information for a page  
*onsuccess returns:* an object containing the information of the page  

#### /api/pages/links  
*method:* **POST**  
*parameters:* **page_id**  
*description:* fetches the links on the page  
*onsuccess returns:* list of links associated with the page  

#### /api/pages/sections  
*method:* **POST**  
*parameters:* **page_id**  
*description:*  fetches the sections of the page  
*onsuccess returns:* list of sections associated with the page  

Links  
----
#### /api/links/prompts  
*method:* **POST**  
*parameters:* **link_id**  
*description:* fetches the prompts that go with the link  
*onsuccess returns:* list of prompts associated with the link  

Notes  
----
#### /api/note/create  
*method:* **POST**  
*parameters:* **user_id**, **note**  
*description:* creates a note entry in the database  
*onsuccess returns:* the note model  

#### /api/note/destroy  
*method:* **POST**  
*parameters:* **note_id**  
*description:* removes the note with the ID from the database  
*onsuccess returns:* success message  
