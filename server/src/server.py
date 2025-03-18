from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import id_token, credentials
from google.auth.transport import requests
from googleapiclient.discovery import build
import os
from src.models import Authorization, User, Calendar, CalendarEvent, CalendarEventDate
import uuid
from src.models import Authorization, User, Calendar, CalendarEvent, CalendarEventDate
# from src.database import get_user_by_email, put_user
from datetime import datetime, timezone

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://slack-status-syncer-801397650398.us-central1.run.app"
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID")
SLACK_CLIENT_SECRET = os.environ.get("SLACK_CLIENT_SECRET")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

# Parses the "Authorization" header for a request, and verifies the token is valid with Firebase
# Also parses the "X-Google-Access-Token" header for the Google Access (OAuth) Token
# this token is required for making requests for making Google Calendar API requests
def verify_authorization(authorization: str = Header(None), x_google_access_token: str = Header(None)) -> Authorization:
    if not authorization:
        raise HTTPException(status_code=401, detail="Request is missing Authorization header")
    
    try:
        token = authorization.split("Bearer ")[1]
        decoded = id_token.verify_firebase_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        if not x_google_access_token:
            raise HTTPException(status_code=401, detail="Request is missing Google Access Token header")
        
        return Authorization(id_token=token, access_token=x_google_access_token, data=decoded)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")


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
    # No persistent storage right now... just returning right back to the user
    return User(id=uuid.uuid4(), email=auth.data["email"], display_name=auth.data["name"])

    # Check if user already exists; if so, return
    # user = get_user_by_email(user_data.email)
    # if user:
    #     return
    # # Otherwise, lazy create new user
    # return put_user(User(id=uuid.uuid4(), email=user_data.email, display_name=user_data.display_name))


############################################
# CALENDAR ROUTES
############################################
# GET /calendars
# Returns a list of all Google Calendar objects for a user
@app.get("/calendars", response_model=list[Calendar])
async def get_calendars(auth: Authorization = Depends(verify_authorization)):
    cred = credentials.Credentials(token=auth.access_token)
    service = build('calendar', 'v3', credentials=cred)
    try:
        calendars = service.calendarList().list().execute()
        items = calendars.get('items', [])
        return [
            Calendar(
                id=item['id'],
                user_id=auth.data['sub'],
                summary=item['summary'],
                description=item.get('description', ''),
                timezone=item['timeZone']
            ) for item in items
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
async def get_calendar_events(calendar_id: str, auth: Authorization = Depends(verify_authorization)):
    cred = credentials.Credentials(token=auth.access_token)
    service = build('calendar', 'v3', credentials=cred)
    try:
        # Get events in the specified calendar, *after* the current time
        events = service.events().list(calendarId=calendar_id, timeMin=datetime.now(timezone.utc).isoformat()).execute()
        items = events.get('items', [])
        print(items)
        return [
            CalendarEvent(
                id=item['id'],
                calendar_id=calendar_id,
                summary=item['summary'],
                description=item.get('description', ''),
                start=CalendarEventDate(
                    date=item['start'].get('date', ''),
                    dateTime=item['start'].get('dateTime'),
                    timeZone=item['start'].get('timeZone', '')
                ),
                end=CalendarEventDate(
                    date=item['end'].get('date', ''),
                    dateTime=item['end'].get('dateTime'),
                    timeZone=item['end'].get('timeZone', '')
                )
            ) for item in items
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error retrieving calendars")
