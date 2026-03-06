# To Do List

An app so simple to use you will actually use it. Whether you have daily routines, one-time errands, or occasional tasks, this app will defog your mind.

Goal is not task management but *gentle remembering without emotional penalty.*

Live: https://elisecode247.github.io/to-do-list/

## Features

- **Frequency-based mode**: Categorize tasks as daily, one-time, or occasional
- **Smart filtering**: Quickly view tasks by category with visual counters [See here for rules](./task-filtering-notes.md)

- **Drag and drop**: Easily reorder tasks to match your priorities
- **Task management**: Check off completed items, edit tasks, or delete them
- **Archive system**: Keep your list clean while preserving completed tasks
- **Intuitive interface**: Clean, distraction-free design with a vibrant purple theme


### To do
- ux: improvements
    - keyboard tabbing for panels
    - lost internet connection
    - make localStorage persistent longer on mobile
    - add close buttons on panels in desktop view
    - fix font color on google calendar events
    - show days countdown for google calendar events
    - remove subsequent fetch calls to google-client-id when menu open
- bug: app notes does not load on route change
- feature: calendar tasks
- ux: improve ux for newly logged in user
- feature: allow user delete history
- feature: add undo to delete and uncheck
- feature: custom categories
- security: access token in memory
- security: refresh token in HttpOnly Secure SameSite cookie
- tech-debt: split google client id into local and prod
- chore: reset all env variables
- infra: move frontend code to Railway (WPF Chp 3)
    - set up cdn on Railway https://docs.railway.com/guides/add-a-cdn-using-cloudfront
    - set max-age to a year for cache-control header (check cdn as well)

