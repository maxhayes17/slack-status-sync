from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Authorization(BaseModel):
    id_token: str
    access_token: str
    data: dict


class User(BaseModel):
    id: str
    firebase_user_id: str
    email: str
    display_name: str
    # TODO - where should these be stored?
    slack_access_token: Optional[str] = None


# Google Calendar objects


class CalendarColor(BaseModel):
    background: str
    foreground: str


class Calendar(BaseModel):
    id: str
    user_id: str
    summary: str
    description: str
    color: Optional[CalendarColor] = None
    timezone: str


class CalendarEvent(BaseModel):
    id: str
    calendar_id: str
    summary: str
    description: str
    color: Optional[CalendarColor] = None
    start: datetime
    end: datetime
    all_day: bool


# Calendar event with Slack status
class StatusEvent(BaseModel):
    id: str
    user_id: str
    calendar_id: str
    event_id: str
    start: datetime
    end: datetime
    status_text: str
    status_emoji: Optional[str] = None
    # unix timestamp of end time
    status_expiration: float


class StatusEventRequest(BaseModel):
    calendarId: str
    eventId: str
    start: datetime
    end: datetime
    statusText: str
    statusEmoji: Optional[str] = None
