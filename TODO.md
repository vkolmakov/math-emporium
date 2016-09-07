# TODO #

## Scheduling app ##

* ~~Finish up openSpots service and API endpoint **[server]**~~
  - ~~add Google Calendar connection~~

* ~~Build the front to display openSpots results **[client]**~~

* ~~Add user-related API endpoints **[server]**~~
  - ~~add more fields in the user model (next appointment date + calendar-id, etc)~~
  - ~~add ability to edit profile and create Google Calendar appointments~~

* ~~Build front for user-related endpoints + add appropriate event listeners on the openSpot component **[client]**~~

* ~~Add ability to leave additional comments as a user for a scheduled appointment~~

* ~~Email reminders for scheduled appointments~~


## Editing app ##

* Real-time calendar representation in edit-schedule **[~~server~~ + client]**

* Useful tutor overview page **[client]**

* Display server-side errors on top of the table **[client]**

## Managing app ##

* ~~Better navigation (filter users by access groups)~~

* Ability to search through users **[client]**

## General ##

* ~~Add group-based auth **[server + client]**~~
  - ~~require group 2+ for schedule C_UD routes~~
  - ~~require group 1+ for schedule _R__ routes~~
  - ~~group 0+ for user-related stuff~~
  - ~~Add a sidebar config property which will allow to display different things based on the access level~~

* ~~Add endpoints and views for editing user-related stuff **[server + client]**~~

* ~~Complete client-side verification for most routes **[client]**~~

* ~~Add password reset functionality **[server + client]**~~

* Complete server-side verification for several models **[server]**
  - Check the existence of one-to-many relationships on any object before allowing to remove it (~~Locations~~, Courses?, Tutors?, Schedules?)

* Refactor + add more features in the edit-schedule app **[client]**
  - Add ability to bulk-add schedules by submitting a list of times **[+server]**

* Optimize some backend stuff **[server]**
  - Optimize openSpots service
