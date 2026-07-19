# Daily Reset List

A daily task list that offers *gentle remembering without emotional penalty.*

Live: https://dailyresetlist.com

## Features
* low pressure: no goals, no habit tracking, and no gamification
* tasks that reset each day and an be easily skipped and delayed
* shows the last time you completed a task
* includes an encrypted interstitial journal to combat context switching and procrastination

## Todo
* Add a few end-to-end tests covering login/refresh, task creation and deletion, encryption recovery/export, account deletion, and Calendar connection/revocation. The existing 151 tests pass, but they mainly cover utilities and template data.
* Add production error monitoring, availability checks, and a way for testers to report feedback.
* Verify production OAuth scopes, cookie settings, rate limiting, CORS, account deletion, and data-loss behavior against the backend.
* Reconcile the privacy policy’s “not end-to-end encrypted” journal language with the app/README’s “encrypted journal” description.
* Add a meta description to [index.html (line 4)](/Users/elisestraub/Projects/daily-to-do/index.html:4).
* Artist to create manifest and og images
* theme-based "stars"
* review landing page language



Verify production CORS and cookie settings

Confirm cookies use Secure, HttpOnly, and appropriate SameSite values

Add rate limits to authentication and destructive endpoints

Verify users cannot access another user’s tasks or journal entries

Validate and sanitize all server inputs

Confirm OAuth requests use only necessary scopes

Test token expiration and revoked Google access

Confirm the privacy policy matches actual storage, encryption, retention, and deletion behavior

Ensure secrets and production credentials are absent from the frontend and repository
Reliability and operations

Add production error monitoring with release/version information

Add uptime monitoring for the site and API

Create alerts for elevated authentication and API failures

Decide how user data will be recovered after accidental loss

Test database restoration if backups exist

Document deployment and rollback steps

Confirm production and development environments are isolated

Add a health-check endpoint

Verify custom-domain HTTPS and certificate renewal
Beta program

Start with 5–10 trusted testers

Clearly label the product as beta

Tell testers what data is stored and whether it is real or disposable

Provide a visible feedback/support link

Create a short feedback form covering bugs, confusion, and missing features

Give testers a few representative tasks to try

Provide instructions for reporting a bug, including device and browser

Keep a prioritized issue tracker

Define conditions for pausing the beta, such as data loss or account-access problems

Schedule a review after the first week
