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
    return (
      data &&
      Array.isArray(data) &&
      data.map((emoji: any) => {
        return {
          name: emoji.name,
          path: emoji.path,
        } as Emoji;
      })
    );
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
    return (
      data &&
      ({
        id: data.id,
        display_name: data.display_name,
        email: data.email,
        slack_user_id: data.slack_user_id,
      } as User)
    );
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
    return (
      data &&
      Array.isArray(data) &&
      data.map((calendar: any) => {
        return {
          id: calendar.id,
          summary: calendar.summary,
          description: calendar.description,
          color: calendar.color,
          timezone: calendar.timezone,
        } as Calendar;
      })
    );
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
    return (
      data &&
      Array.isArray(data) &&
      data.map((event: any) => {
        return {
          id: event.id,
          calendar_id: event.calendar_id,
          summary: event.summary,
          description: event.description,
          color: event.color,
          start: event.start,
          end: event.end,
          all_day: event.all_day,
        } as CalendarEvent;
      })
    );
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
    return (
      data &&
      Array.isArray(data) &&
      data.map((statusEvent: any) => {
        return {
          id: statusEvent.id,
          user_id: statusEvent.user_id,
          calendar_id: statusEvent.calendar_id,
          event_id: statusEvent.event_id,
          start: statusEvent.start,
          end: statusEvent.end,
          status_text: statusEvent.status_text,
          status_emoji: statusEvent.status_emoji,
          status_expiration: statusEvent.status_expiration,
        } as StatusEvent;
      })
    );
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
    return (
      data &&
      ({
        id: data.id,
        user_id: data.user_id,
        calendar_id: data.calendar_id,
        event_id: data.event_id,
        start: data.start,
        end: data.end,
        status_text: data.status_text,
        status_emoji: data.status_emoji,
        status_expiration: data.status_expiration,
      } as StatusEvent)
    );
  } catch (error) {
    console.error("Error posting status event:", error);
    return null;
  }
};

export const patchStatusEvent = async (
  statusEvent: StatusEvent
): Promise<StatusEvent | null> => {
  try {
    const resp = await fetch(
      `${STATUS_SYNCER_SERVER_URL}/status-events/${statusEvent.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(statusEvent),
      }
    );
    const data = await resp.json();
    return (
      data &&
      ({
        id: data.id,
        user_id: data.user_id,
        calendar_id: data.calendar_id,
        event_id: data.event_id,
        start: data.start,
        end: data.end,
        status_text: data.status_text,
        status_emoji: data.status_emoji,
        status_expiration: data.status_expiration,
      } as StatusEvent)
    );
  } catch (error) {
    console.error("Error posting status event:", error);
    return null;
  }
};

export const deleteStatusEvent = async (statusEvent: StatusEvent) => {
  try {
    await fetch(`${STATUS_SYNCER_SERVER_URL}/status-events/${statusEvent.id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting status event:", error);
  }
};
