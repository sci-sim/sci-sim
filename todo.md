#TODO

1. We have two use cases right now: Students "running" a simulation, and educators editing a simulation. It seems like we should focus on the former to start with, and save the editor for later (due to time crunch). We can say with 100% certainty that we will need a full create/read/update/delete API for all the models in the database for the editor, but for the students running a simulation, the only create/edit operations will be for the student tracking information, plus the student's notebook entries that they create during the simulation. I think your top priority should be to ensure the API suffices for student use, so that Darien's javascript student front-end will be able to interface with the database.

2. We also need to figure out how to track user logins in the javascript front-end. Previously I relied on the http session cookies to identify users, but we don't know if this will work when we have a javascript front-end between the student's browser and the API calls. Next priority would be to figure this out.

3. Once we know how we are going to have each student's computer know which user they are (#2 above), then we can look at how to recover an interrupted session. This may involve a "Missing student" timeout or just allow the student to immediately resume their session.

4. Did we ever reach a well-defined set of behaviors for handling the user-group connections? If not, work with Darien and Dr. Peffer to write out precisely how this should work.

5. Work with Dr. Peffer to determine how she wants student results reported. I know she has mentioned having a CSV or XLS file export feature, with one spreadsheet row per student. Work with Dr. Peffer to determine exactly what she is looking for in each column, if her desires are specific to the May 1 simulation or if they are sufficiently general-purpose to support in the simulation engine.

6. Start thinking about the advanced simulation features that Dr. Peffer has been talking about (i.e. chat dialogs, etc).
