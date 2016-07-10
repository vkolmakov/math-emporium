# TODO #

## Scheduling app ##

* <del>Finish up openSpots service and API endpoint **[server]**</del>
  - <del>add Google Calendar connection</del>

* Build the front to display openSpots results **[client]**

* Add user-related API endpoints **[server]**
  - add more fields in the user model (next appointment date + calendar-id, etc)
  - add ability to edit profile and create Google Calendar appointmnents

* Build front for user-related endpoints **[client]**

## General ##

* Add group-based auth **[server]**
  - require group 2+ for schedule CRUD routes
  - group 0+ for user-related stuff

* Complete server-side vefification for several models **[server]**

* Refactor + add more features in the edit-schedule app **[client]**

* Add a model + endpoints for helpful resources (title, link, description, related courses) + front for them **[server + client]**
