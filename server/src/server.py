import requests
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import id_token, credentials
from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
from google.auth.transport import requests as google_requests
from googleapiclient.discovery import build
import firebase_admin
from firebase_admin import auth
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
    update_status_event,
    get_status_event_by_id,
    get_status_events_by_user,
    delete_status_event as delete_db_status_event,
)
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

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

if not firebase_admin._apps:
    firebase_admin.initialize_app()

tasks_client = tasks_v2.CloudTasksClient()


# Verifies the Firebase ID token is valid for this app
def verify_firebase_id_token(token: str):
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")


# Verifies the Google Access Token is valid for this app
# this has to be done via API request since Google auth libraries don't support
# opaque tokens (i.e., tokens not in JWT format)
def verify_google_access_token(token: str):
    try:
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={token}"
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=401, detail="Failed verifying Google Access Token"
            )

        data = response.json()
        if data["aud"] != GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=401, detail="Google Access Token is not valid for this app"
            )
        return data

    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid Google Access Token")


# Verifies requests made from Google Cloud Task API
# this is verified separately from user requests since the Google Cloud Task API headers are slightly different
# this is broken out from the verify_authorization function since the headers slightly differ
def verify_google_cloud_auth(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Google Cloud request is missing Authorization header",
        )
    try:
        token = authorization.split("Bearer ")[1]
        if not token:
            raise HTTPException(
                status_code=401, detail="Google Cloud request is missing token"
            )
        # can use verify_oauth2_token since this token *is* a JWT
        decoded = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
        )
        if not decoded["aud"].startswith(SERVER_BASE_URL):
            raise HTTPException(
                status_code=401,
                detail="Google Cloud request has invalid audience",
            )
        if not decoded["email"] == GOOGLE_CLOUD_SERVICE_ACCOUNT:
            raise HTTPException(
                status_code=401,
                detail="Google Cloud request has invalid service account",
            )
        return decoded
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")


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
    if not x_oauth_access_token:
        raise HTTPException(
            status_code=401, detail="Request is missing Google Access Token header"
        )
    try:
        token = authorization.split("Bearer ")[1]
        decoded_id_token = verify_firebase_id_token(token)
        # don't need to assign a value since we don't do anything with the decoded access token
        verify_google_access_token(x_oauth_access_token)

        return Authorization(
            id_token=token, access_token=x_oauth_access_token, data=decoded_id_token
        )
    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")


# Resolve a user from their Authorization headers
# This function is used to verify the user making the request is the user they claim to be
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


# Get authentication url from Slack, and pass it back to the frontend
# this is the first step in authentication;
# Slack will hit the REDIRECT_URI (which finishes the process) after the user approves in the browser
@app.get("/auth/slack")
async def auth_slack(auth: Authorization = Depends(verify_authorization)):
    user = resolve_user(auth)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    auth_url = f"{SLACK_OAUTH_BASE_URL}?client_id={SLACK_CLIENT_ID}&user_scope={SLACK_AUTH_SCOPES}&redirect_uri={SLACK_REDIRECT_URI}&state={user.id}"
    return {"url": auth_url}


# Callback endpoint for Slack authentication
# Slack will hit this endpoint after the user approves the authentication request
# This endpoint makes an access request to slack, stores the user's slack_user_id and slack_access_token
# then redirects back to the home page
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


# Gets all emojis in the slack workspace a user has approved access to
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

        path = "https://slack.com/api/emoji.list?include_categories=True&pretty=1"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(path, headers=headers)
        data = response.json()

        if not data.get("ok"):
            raise HTTPException(
                status_code=400, detail="Failed retrieving emojis from Slack"
            )

        slack_emojis = [
            Emoji(name=k, path=v)
            for k, v in data["emoji"].items()
            # some emojis are aliases for other emojis... ignore these for now
            if v.startswith("http")
        ]
        base_emojis = []
        for category in data["categories"]:
            for emoji_name in category["emoji_names"]:
                emoji = Emoji(name=emoji_name)
                base_emojis.append(emoji)

        return slack_emojis + base_emojis

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving slack emojis")


############################################
# USER ROUTES
############################################


# Get the current user, based on their authorization headers
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
        # strip sensitive data from user before passing back
        user.slack_access_token = None
        return user
    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving user")


############################################
# STATUS EVENT ROUTES
############################################


# POST /status-events
# Create a new status event for a user, and queue it to be synced with Slack
@app.post("/status-events", response_model=StatusEvent)
async def post_status_event(
    req: StatusEventRequest, auth: Authorization = Depends(verify_authorization)
):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        # create status event from partial object
        status_event = StatusEvent(
            # ID will be generated when event is created with firebase
            id="",
            user_id=user.id,
            calendar_id=req.calendar_id,
            event_id=req.event_id,
            start=req.start,
            end=req.end,
            status_text=req.status_text,
            status_emoji=req.status_emoji,
            status_expiration=req.end.timestamp(),  # Unix timestamp of end
        )

        new_status_event = put_status_event(status_event)

        # queue status event for syncing
        schedule_time = new_status_event.start
        task = create_task(new_status_event.id, schedule_time)
        if not task:
            raise HTTPException(status_code=500, detail="Error creating task")

        # update new event with task id
        new_status_event.task_id = task.name.split("/")[-1]
        # update status event in db
        return update_status_event(new_status_event)

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error creating status event")


# PATCH /status-events/{status_event_id}
# Update the status event details for a specific event
@app.patch("/status-events/{status_event_id}", response_model=StatusEvent)
async def patch_status_event(
    status_event_id: str,
    req: StatusEvent,
    auth: Authorization = Depends(verify_authorization),
):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        # update status event
        status_event = get_status_event_by_id(status_event_id)
        if not status_event:
            raise HTTPException(status_code=404, detail="Status event not found")

        new_status_event = StatusEvent(
            id=status_event.id,
            user_id=status_event.user_id,
            calendar_id=status_event.calendar_id,
            event_id=status_event.event_id,
            start=status_event.start,
            end=status_event.end,
            # text and emoji are the only fields that can be edited
            status_text=req.status_text,
            status_emoji=req.status_emoji,
            status_expiration=status_event.end.timestamp(),  # Unix timestamp of end
        )

        return update_status_event(new_status_event)
    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error updating status event")


@app.delete("/status-events/{status_event_id}")
async def delete_status_event(
    status_event_id: str, auth: Authorization = Depends(verify_authorization)
):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        # make sure status event exists
        status_event = get_status_event_by_id(status_event_id)
        if not status_event:
            raise HTTPException(status_code=404, detail="Status event not found")

        # delete queued task for event if before the event start time
        if datetime.now(timezone.utc) < status_event.start.replace(tzinfo=timezone.utc):
            delete_task(status_event.task_id)

        # delete status event in DB
        deleted = delete_db_status_event(status_event_id)
        if not deleted:
            raise HTTPException(status_code=500, detail="Error deleting status event")

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error deleting status event")


# GET /status-events
# Returns a list of all status events *for a user*
@app.get("/status-events", response_model=list[StatusEvent])
async def get_status_events(
    auth: Authorization = Depends(verify_authorization),
):
    try:
        # resolve user from auth
        user = resolve_user(auth)
        # return all status events for that user
        return get_status_events_by_user(user.id)

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving status events")


############################################
# CALENDAR ROUTES
############################################


# GET /calendars
# Returns a list of all Google Calendars for a user
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

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
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
        calendar = service.calendarList().get(calendarId=calendar_id).execute()
        # get the timezone for this calendar, to offset events
        # if no timezone is set, default to UTC
        time_zone = ZoneInfo(calendar.get("timeZone", "UTC"))
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
                start=parse_event_time(item["start"], time_zone),
                end=parse_event_time(item["end"], time_zone),
                # True if the "date" field is present, which only occurs for all-day events
                all_day="date" in item["start"],
            )
            for item in items
        ]
    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving calendars")


# Helper to parse the event time to datetime, no matter how Google Calendars returns it
def parse_event_time(event_time: dict, time_zone: ZoneInfo) -> datetime:
    # If an event is all-day, the "date" field is present, and a datetime needs to be created
    if "date" in event_time:
        # All-day event, parse only the date
        dt = datetime.strptime(event_time["date"], "%Y-%m-%d")
    # otherwise, the "dateTime" field is present, and just needs to be converted to a datetime type
    elif "dateTime" in event_time:
        # Event with specific time
        dt = datetime.fromisoformat(event_time["dateTime"])

    if dt.tzinfo is None:
        # if the timezone is not set, set it to the calendar's timezone
        dt = dt.replace(tzinfo=time_zone)

    return dt


############################################
# SYNCER (Google Tasks) ROUTES
############################################


# Create a Google Tasks API task, and add it to the current queue
# when triggered (at the schedule_time), this task will hit the "/status-events/{status_event_id}/sync" endpoint
# with the provided body
def create_task(status_event_id: str, schedule_time: datetime):
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
            "url": f"{SERVER_BASE_URL}/status-events/{status_event_id}/sync",
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


def delete_task(task_id: str):
    # configure path for queue
    path = tasks_client.queue_path(
        GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_QUEUE_NAME
    )
    # delete task
    tasks_client.delete_task(tasks_v2.DeleteTaskRequest(name=f"{path}/tasks/{task_id}"))


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

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error updating Slack status")


# POST /status-events/{status_event_id}/sync
# This endpoint is hit by the Google Tasks API, and syncs the status event with Slack;
# resolves the status event by the path param, and updates the user's slack status with the status event's details
@app.post("/status-events/{status_event_id}/sync")
async def sync_status_event(
    status_event_id: str,
    auth: str = Depends(verify_google_cloud_auth),
):
    try:
        if not auth:
            raise HTTPException(status_code=401, detail="Invalid token")

        # get status event by path param
        status_event = get_status_event_by_id(status_event_id)
        if not status_event:
            raise HTTPException(status_code=404, detail="Status event not found")

        # update slack status with status event
        response = update_slack_status(status_event)
        if not response:
            raise HTTPException(status_code=500, detail="Error syncing status event")

    # bubble up any specific exception raised in the try block
    except HTTPException as http_exception:
        raise http_exception
    # catch all other exceptions, and raise as a 500
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error syncing status event")
