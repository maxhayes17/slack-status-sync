from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import id_token, credentials
from google.auth.transport import requests
from googleapiclient.discovery import build
import os
from src.models import (
    Authorization,
    User,
    Calendar,
    CalendarEvent,
    StatusEvent,
    StatusEventRequest,
)
from src.database import (
    get_user_by_firebase_user_id,
    put_user,
    put_status_event,
    get_status_events_by_user,
)
from datetime import datetime, timezone, timedelta

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://slack-status-syncer-801397650398.us-central1.run.app",
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID")
SLACK_CLIENT_SECRET = os.environ.get("SLACK_CLIENT_SECRET")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")


# Parses the "Authorization" header for a request, and verifies the token is valid with Firebase
# Also parses the "X-OAuth-Access-Token" header for the Google (OAuth) Access Token
# this token is required for making requests for making Google Calendar API requests
def verify_authorization(
    authorization: str = Header(None), x_oauth_access_token: str = Header(None)
) -> Authorization:
    if not authorization:
        raise HTTPException(
            status_code=401, detail="Request is missing Authorization header"
        )

    try:
        token = authorization.split("Bearer ")[1]
        # TODO - this is not very secure - should verify with firebase service account?
        decoded = id_token.verify_firebase_token(
            token, requests.Request(), FIREBASE_PROJECT_ID
        )

        # TODO - should actually verify this token
        if not x_oauth_access_token:
            raise HTTPException(
                status_code=401, detail="Request is missing Google Access Token header"
            )

        return Authorization(
            id_token=token, access_token=x_oauth_access_token, data=decoded
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")


def resolve_user(auth: Authorization) -> User:
    user = get_user_by_firebase_user_id(auth.data["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/")
async def root():
    return {"message": "FastAPI Server running"}


############################################
# AUTH ROUTES
############################################
# Auth with Slack
# @app.post("/auth/slack")
# async def auth_slack():
#     return {"message": "You are now auth'd with Slack!"}


############################################
# USER ROUTES
############################################
@app.get("/users/me", response_model=User)
async def get_user(auth: Authorization = Depends(verify_authorization)):
    try:
        user = get_user_by_firebase_user_id(auth.data["user_id"])
        if not user:
            return put_user(
                User(
                    id="",
                    firebase_user_id=auth.data["user_id"],
                    email=auth.data["email"],
                    display_name=auth.data["name"],
                )
            )
        return user
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving user")


############################################
# STATUS EVENT ROUTES
############################################
@app.post("/status-events", response_model=StatusEvent)
async def post_status_event(
    event: StatusEventRequest, auth: Authorization = Depends(verify_authorization)
):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        # create status event from partial object
        status_event = StatusEvent(
            # ID will be generated when event is created with firebase
            id="",
            user_id=user.id,
            calendar_id=event.calendarId,
            event_id=event.eventId,
            start=event.start,
            end=event.end,
            status_text=event.statusText,
            status_emoji=event.statusEmoji,
            status_expiration=event.end.timestamp(),  # Unix timestamp of end
        )
        return put_status_event(status_event)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error creating status event")


@app.get("/status-events", response_model=list[StatusEvent])
async def get_status_events(
    auth: Authorization = Depends(verify_authorization),
):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        # return all status events for that user
        return get_status_events_by_user(user.id)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving status events")


############################################
# CALENDAR ROUTES
############################################
# GET /calendars
# Returns a list of all Google Calendar objects for a user
@app.get("/calendars", response_model=list[Calendar])
async def get_calendars(auth: Authorization = Depends(verify_authorization)):
    cred = credentials.Credentials(token=auth.access_token)
    service = build("calendar", "v3", credentials=cred)
    try:
        calendars = service.calendarList().list().execute()
        items = calendars.get("items", [])
        return [
            Calendar(
                id=item["id"],
                user_id=auth.data["sub"],
                summary=item["summary"],
                description=item.get("description", ""),
                timezone=item["timeZone"],
            )
            for item in items
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving calendars")


############################################
# CALENDAR EVENT ROUTES
############################################
# GET /calendars/:calendarID/events
# Returns a list of all events for a given Google Calendar
@app.get("/calendars/{calendar_id}/events", response_model=list[CalendarEvent])
async def get_calendar_events(
    calendar_id: str, auth: Authorization = Depends(verify_authorization)
):
    cred = credentials.Credentials(token=auth.access_token)
    service = build("calendar", "v3", credentials=cred)
    try:
        # Set constraints for the current day, and a year from the current day
        time_now = datetime.now(timezone.utc)
        time_max = time_now + timedelta(days=365)
        # Get events in the specified calendar, *after* the current time
        events = (
            service.events()
            .list(
                calendarId=calendar_id,
                timeMin=time_now.isoformat(),
                timeMax=time_max.isoformat(),
            )
            .execute()
        )
        items = events.get("items", [])
        return [
            CalendarEvent(
                id=item["id"],
                calendar_id=calendar_id,
                summary=item.get("summary", ""),
                description=item.get("description", ""),
                start=parse_event_time(item["start"]),
                end=parse_event_time(item["end"]),
                # True if the "date" field is present, which only occurs for all-day events
                all_day="date" in item["start"],
            )
            for item in items
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving calendars")


# Helper to parse the event time to datetime, no matter how Google Calendars returns it
def parse_event_time(event_time: dict) -> datetime:
    # If an event is all-day, the "date" field is present, and a datetime needs to be created
    if "date" in event_time:
        # All-day event, parse only the date
        return datetime.strptime(event_time["date"], "%Y-%m-%d")
    # otherwise, the "dateTime" field is present, and just needs to be converted to a datetime type
    elif "dateTime" in event_time:
        # Event with specific time
        return datetime.fromisoformat(event_time["dateTime"])
    return None
