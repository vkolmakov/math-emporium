# TODO #

## Scheduling app ##

* ~~Finish up openSpots service and API endpoint **[server]**~~
  - ~~add Google Calendar connection~~

* ~~Build the front to display openSpots results **[client]**~~

* ~~Add user-related API endpoints **[server]**~~
  - ~~add more fields in the user model (next appointment date + calendar-id, etc)~~
  - ~~add ability to edit profile and create Google Calendar appointmnents~~

* ~~Build front for user-related endpoints + add appropriate event listeners on the openSpot component **[client]**~~

## General ##

* Add group-based auth **[server]**
  - require group 2+ for schedule C_UD routes
  - require group 1+ for schedule _R__ routes
  - group 0+ for user-related stuff
  - Add a sidebar config property which will allow to display different things based on the access level

* Add endpoints and views for editing user-related stuff

* Complete client-side verification for most routes

* Add password reset functionality

* Complete server-side vefification for several models **[server]**

* Refactor + add more features in the edit-schedule app **[client]**

* Add a model + endpoints for helpful resources (title, link, description, related courses) + front for them **[server + client]**
