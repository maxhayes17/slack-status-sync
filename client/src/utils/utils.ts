import { getAuthHeaders } from "./auth";
import { Calendar, User, CalendarEvent, StatusEvent, Emoji } from "./types";

export const STATUS_SYNCER_SERVER_URL =
  process.env.REACT_APP_STATUS_SYNCER_SERVER_URL;

export const getSlackAuthentication = async () => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/auth/slack`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    window.location.href = data.url;
  } catch (error) {
    console.error("Error authenticating with Slack", error);
    return null;
  }
};

export const getSlackEmojis = async () => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/slack/emojis`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    console.log(data);
    return data.map((emoji: any) => {
      return {
        name: emoji.name,
        path: emoji.path,
      } as Emoji;
    });
  } catch (error) {
    console.error("Error fetching Slack emojis", error);
    return null;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/users/me`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    console.log(data);
    return {
      id: data.id,
      displayName: data.display_name,
      email: data.email,
      slack_user_id: data.slack_user_id,
    } as User;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const getCalendars = async (): Promise<Calendar[] | null> => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/calendars`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    const calendars = data.map((calendar: any) => {
      return {
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        color: calendar.color,
        timezone: calendar.timezone,
      } as Calendar;
    });
    console.log(calendars);
    return calendars;
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return null;
  }
};

export const getCalendarEvents = async (
  calendarId: string
): Promise<CalendarEvent[] | null> => {
  try {
    // since these ids can have some special characters, encode before fetching
    const encodedCalendarId = encodeURIComponent(calendarId);

    const resp = await fetch(
      `${STATUS_SYNCER_SERVER_URL}/calendars/${encodedCalendarId}/events`,
      {
        headers: await getAuthHeaders(),
      }
    );
    const data = await resp.json();
    console.log(data);
    return data.map((event: any) => {
      return {
        id: event.id,
        calendarId: event.calendar_id,
        summary: event.summary,
        description: event.description,
        color: event.color,
        start: event.start,
        end: event.end,
        allDay: event.all_day,
      } as CalendarEvent;
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return null;
  }
};

export const getStatusEvents = async (): Promise<StatusEvent[] | null> => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/status-events`, {
      headers: await getAuthHeaders(),
    });
    const data = await resp.json();
    console.log(data);
    return data.map((statusEvent: any) => {
      return {
        id: statusEvent.id,
        calendarId: statusEvent.calendar_id,
        eventId: statusEvent.event_id,
        start: statusEvent.start,
        end: statusEvent.end,
        statusText: statusEvent.status_text,
        statusEmoji: statusEvent.status_emoji,
      } as StatusEvent;
    });
  } catch (error) {
    console.error("Error fetching status events:", error);
    return null;
  }
};

export const postStatusEvent = async (
  statusEvent: Partial<StatusEvent>
): Promise<StatusEvent | null> => {
  try {
    const resp = await fetch(`${STATUS_SYNCER_SERVER_URL}/status-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(statusEvent),
    });
    const data = await resp.json();
    return {
      id: data.id,
      calendarId: data.calendar_id,
      eventId: data.event_id,
      start: data.start,
      end: data.end,
      statusText: data.status_text,
      statusEmoji: data.status_emoji,
    } as StatusEvent;
  } catch (error) {
    console.error("Error posting status event:", error);
    return null;
  }
};
