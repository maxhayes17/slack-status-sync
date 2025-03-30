# Slack Status Syncer

Maximus Hayes

## Overview

Slack's [status feature](https://slack.com/help/articles/201864558-Set-your-Slack-status-and-availability) is a great way to keep your team informed about your availability, whether you're in a meeting, focusing on deep work, or away from your desk. However, it requires manual updates, with no built-in way to schedule statuses in advance.

**Slack Status Syncer** solves this limitation by automatically updating your Slack status based on your Google Calendar events. Users can customize their Slack status for specific events, ensuring their availability is accurately reflected in Slack while the event is happening, without manual intervention.

Slack Status Syncer provides full control over your status updates, allowing users to personalize their messages and automate their workflow efficiently.

### Project Layout

```
/slack-status-sync
│── server/                 # FastAPI backend
│   ├── src/
│   │   ├── server.py       # Main FastAPI application with route handlers
│   │   ├── models.py       # Pydantic models for data validation and serialization
│   │   ├── database.py     # Firestore database interaction utilities
│   ├── Dockerfile          # Dockerfile for locally running Backend services
|
│── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── hooks/          # Custom React hooks for state management
│   │   ├── utils/          # Helper functions for API requests and business logic
│   ├── Dockerfile          # Dockerfile for running Frontend services
│
│── README.md               # Project documentation
```

### Important Technologies and Interactions

This application is built with a FastAPI backend, a React TypeScript frontend, and integrates with multiple Google Cloud services and the Slack API.

#### Google Cloud Services

* **Cloud Build** - Automates CI/CD workflow for building and deploying the application

* **Artifact Registry** - Stores and manages container images for deployment

* **Cloud Run** - Provides a scalable hosting environment for backend and frontend services

* **Firebase/Identity Platform** – Handles user authentication with Google OAuth2

* **Cloud Firestore** – Object storage for managing user and status event records

* **Google Calendar API** – Retrieves user calendars and events from their connected Google account

* **Cloud Tasks** – Schedules and executes asynchronous API calls to update Slack status at the appropriate times

#### OAuth with Google

#### Slack Authentication

#### Creating Status Events

#### Updating Slack Status

## Demo