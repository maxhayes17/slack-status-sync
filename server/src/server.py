import requests
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from google.oauth2 import id_token, credentials
from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
from google.auth.transport import requests as google_requests
from googleapiclient.discovery import build
import os
from src.models import (
    Authorization,
    User,
    Calendar,
    CalendarEvent,
    CalendarColor,
    Emoji,
    StatusEvent,
    StatusEventRequest,
)
from src.database import (
    get_user_by_id,
    get_user_by_firebase_user_id,
    put_user,
    update_user,
    put_status_event,
    get_status_event_by_id,
    get_status_events_by_user,
)
from datetime import datetime, timezone, timedelta

SERVER_BASE_URL = os.environ.get("SERVER_BASE_URL")
CLIENT_BASE_URL = os.environ.get("CLIENT_BASE_URL")

FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID")
SLACK_CLIENT_SECRET = os.environ.get("SLACK_CLIENT_SECRET")
SLACK_OAUTH_BASE_URL = "https://slack.com/oauth/v2/authorize"
SLACK_REDIRECT_URI = f"{SERVER_BASE_URL}/auth/slack/callback"
SLACK_AUTH_SCOPES = "users.profile:read,users.profile:write,emoji:read"

GOOGLE_CLOUD_PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT_ID")
GOOGLE_CLOUD_LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION")
GOOGLE_CLOUD_QUEUE_NAME = os.environ.get("GOOGLE_CLOUD_QUEUE_NAME")
GOOGLE_CLOUD_SERVICE_ACCOUNT = os.environ.get("GOOGLE_CLOUD_SERVICE_ACCOUNT")

origins = [
    "http://localhost",
    "http://localhost:3000",
    CLIENT_BASE_URL,
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks_client = tasks_v2.CloudTasksClient()


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
            token, google_requests.Request(), FIREBASE_PROJECT_ID
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
# SLACK ROUTES
############################################
# Auth with Slack
@app.get("/auth/slack")
async def auth_slack(auth: Authorization = Depends(verify_authorization)):
    user = resolve_user(auth)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    auth_url = f"{SLACK_OAUTH_BASE_URL}?client_id={SLACK_CLIENT_ID}&user_scope={SLACK_AUTH_SCOPES}&redirect_uri={SLACK_REDIRECT_URI}&state={user.id}"
    return {"url": auth_url}


@app.get("/auth/slack/callback")
async def auth_slack_callback(request: Request, code: str, state: str):

    # user id maintained in state param to verify user
    user = get_user_by_id(state)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    path = "https://slack.com/api/oauth.v2.access"
    params = {
        "client_id": SLACK_CLIENT_ID,
        "client_secret": SLACK_CLIENT_SECRET,
        "code": code,
        "redirect_uri": SLACK_REDIRECT_URI,
    }
    response = requests.post(path, data=params)
    data = response.json()

    if not data.get("ok"):
        raise HTTPException(status_code=400, detail="Failed Authenticating with Slack")

    # Update user with slack user id and access token
    user.slack_user_id = data["authed_user"]["id"]
    user.slack_access_token = data["authed_user"]["access_token"]
    update_user(user)

    return RedirectResponse(url=f"{CLIENT_BASE_URL}?slack=success")


@app.get("/slack/emojis")
async def get_slack_emojis(auth: Authorization = Depends(verify_authorization)):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token = user.slack_access_token
        if not token:
            raise HTTPException(
                status_code=400, detail="User has not authenticated with Slack"
            )

        path = "https://slack.com/api/emoji.list"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(path, headers=headers)
        data = response.json()

        if not data.get("ok"):
            raise HTTPException(
                status_code=400, detail="Failed retrieving emojis from Slack"
            )

        return [
            Emoji(name=k, path=v)
            for k, v in data["emoji"].items()
            # some emojis are aliases for other emojis... ignore these for now
            if v.startswith("http")
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving slack emojis")


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
            calendar_id=event.calendar_id,
            event_id=event.event_id,
            start=event.start,
            end=event.end,
            status_text=event.status_text,
            status_emoji=event.status_emoji,
            status_expiration=event.end.timestamp(),  # Unix timestamp of end
        )

        new_status_event = put_status_event(status_event)

        # queue status event for syncing
        schedule_time = new_status_event.start
        task = create_task(new_status_event.id, schedule_time)
        if not task:
            raise HTTPException(status_code=500, detail="Error creating task")

        return new_status_event
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
                color=CalendarColor(
                    background=item["backgroundColor"],
                    foreground=item["foregroundColor"],
                ),
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
        # Get color themes for calendar events
        colors = service.colors().get().execute()
        event_colors = colors.get("event", {})

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
                color=(
                    CalendarColor(**event_colors.get(item["colorId"], {}))
                    if "colorId" in item
                    else None
                ),
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


############################################
# SYNCER (Google Tasks) ROUTES
############################################


# Create a Google Tasks API task, and add it to the current queue
# when triggered (at the schedule_time), this task will hit the "/status-events/{event_id}/sync" endpoint
# with the provided body
def create_task(event_id: str, schedule_time: datetime):
    # convert schedule time to utc
    # if the timestamp is not tz-aware, make it tz-aware to utc
    if schedule_time.tzinfo is None:
        schedule_time = schedule_time.replace(tzinfo=timezone.utc)
    # if the timestamp is tz-aware, convert it to utc
    else:
        schedule_time = schedule_time.astimezone(timezone.utc)

    # convert timestamp to protobuf for gcloud
    timestamp = timestamp_pb2.Timestamp()
    timestamp.FromDatetime(schedule_time)

    # define task payload
    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": f"{SERVER_BASE_URL}/status-events/{event_id}/sync",
            # not necessarily needed since this request has no body, but good to have
            "headers": {"Content-Type": "application/json"},
            "oidc_token": {
                "service_account_email": GOOGLE_CLOUD_SERVICE_ACCOUNT,
            },
        },
        "schedule_time": timestamp,
    }
    # configure path for queue
    path = tasks_client.queue_path(
        GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_QUEUE_NAME
    )
    return tasks_client.create_task(tasks_v2.CreateTaskRequest(parent=path, task=task))


def update_slack_status(event: StatusEvent):
    try:
        # resolve user from auth
        user = get_user_by_id(event.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token = user.slack_access_token
        if not token:
            raise HTTPException(
                status_code=400, detail="User has not authenticated with Slack"
            )

        path = "https://slack.com/api/users.profile.set"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        data = {
            "profile": {
                "status_text": event.status_text,
                "status_emoji": (
                    f":{event.status_emoji.name}:" if event.status_emoji else ""
                ),
                "status_expiration": event.status_expiration,
            }
        }
        response = requests.post(path, headers=headers, json=data)
        data = response.json()

        if not data.get("ok"):
            print(data)
            raise HTTPException(
                status_code=400, detail="Failed updating status in Slack"
            )

        return data

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error updating Slack status")


# needs work, but basic check for an auth token
auth_scheme = HTTPBearer()


@app.post("/status-events/{event_id}/sync")
async def sync_status_event(event_id: str, token: str = Depends(auth_scheme)):
    try:
        if not token:
            raise HTTPException(status_code=401, detail="Invalid token")

        # get status event by path param
        status_event = get_status_event_by_id(event_id)
        if not status_event:
            raise HTTPException(status_code=404, detail="Status event not found")

        # update slack status with status event
        response = update_slack_status(status_event)
        if not response:
            raise HTTPException(status_code=500, detail="Error syncing status event")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error syncing status event")
