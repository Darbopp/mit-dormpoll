# MIT 6.170 Final Project

# DormPoll
Deployed Link: https://mit-dormpoll.herokuapp.com/

## Purpose and Functionality
The website serves to modernize MIT Dorm student government polling onto an easy-to-access and easy-to-use platform. Admin can create new polls for users to vote on. A user can login using their MIT username and password through OpenID Connect and navigate to a poll to vote on it. The vote will be successfully stored in a database.

## Notes
We expect every dorm to have a list of kerberoses that correspond to the students who live there. This list of kerberoses are the whitelisted users that are able to login to DormPoll. DormPoll starts off with pre-set admins in the database who can then add/delete other admins and users as needed.

Admins will only be allowed to edit a Poll's name and dates. Changing the dates gives admins the ability to extend a poll.

## Authorship of Files
* Nick Guo: OpenID, sessions, security measures, sign in/out backend, App.js, connecting frontend with backend, results UI
* Darius Bopp: NavBar, React routing, UI touchup, frontend, Material UI, admin access limiting, 404/Home redirecting, API & UI to add/delete users
* Ron Dentinger: routes, model classes, API (create/delete polls), error handling, connecting UI to API, viewing write-in responses
* Claudia Wu: refactored UI code, components, database.js, API and UI to get poll results, admin management, editing polls

## Instructions to Run Locally
In `OidcConstants.js`, set `const url = 'http://127.0.0.1:8000'`.
Modify the database.js to use a database set up on MIT's SQL by placing your own Kereros, Password, and Database Name.

To start express server:
1. Go to `/mit-dorm-poll`
2. Run `npm i` if haven't already
3. Run `npm start`

To start react server (in a separate terminal):
1. Go to `/mit-dorm-poll/client`
2. Run `npm i` if haven't already
3. Run `npm run build`

Navigate to 'http://127.0.0.1:8000'

To be whitelisted onto the server in order to be able to login to DormPoll and access/vote on polls, you must insert your kerberos into the `users` table. To be made into an admin of DormPoll in order to be able to create polls or view results, you must also make sure to set the column `isAdmin` to `1`.

User and admin status can also be set through the UI in the management tool if you are an admin already.

## Shortcomings
Not able to achieve our stretch goals of being able to edit a poll or limit poll access to specific populations (i.e. floor-specific polls).
