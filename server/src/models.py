from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class Authorization(BaseModel):
    id_token: str
    access_token: str
    data: dict

class User(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str
    # TODO - where should these be stored?
    slack_auth_token: Optional[str] = None

# Google Calendar objects
class Calendar(BaseModel):
    id: str
    user_id: str
    summary: str
    description: str
    timezone: str

class CalendarEventDate(BaseModel):
    date: str
    dateTime: Optional[datetime] = None
    timeZone: str

class CalendarEvent(BaseModel):
    id: str
    calendar_id: str
    summary: str
    description: str
    start: CalendarEventDate
    end: CalendarEventDate


# Slack status object
class Status(BaseModel):
    status_text: str
    status_emoji: str

# Calendar event with Slack status
class CalendarEventStatus(BaseModel):
    id: uuid.UUID
    calendar_id: uuid.UUID
    event_id: uuid.UUID
    status: Status
    start: CalendarEventDate
    end: CalendarEventDate